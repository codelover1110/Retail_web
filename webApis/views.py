from django.shortcuts import render

from django.http.response import JsonResponse
from rest_framework.parsers import JSONParser 
from rest_framework import status
from rest_framework.decorators import api_view
from datetime import datetime
import asyncpg
import os
from django.views.decorators.csrf import csrf_exempt
import psycopg2

from configparser import ConfigParser

config = ConfigParser()
config.read('config.ini')
database = config['DEFAULT']['DB_NAME']
user = config['DEFAULT']['DB_USERNAME']
password = config['DEFAULT']['DB_PASSWORD']
host = 'localhost'
port = '5432'

connection = psycopg2.connect(user=user,
                            password=password,
                            host=host,
                            port=port,
                            database=database)

cursor = connection.cursor()


# Create your views here.
# @api_view(['GET', 'PUT', 'DELETE'])
def get_table_list(request):
    query = "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    table_list =  query_tables(query)
    return JsonResponse({'tables': table_list}, status=status.HTTP_201_CREATED)

@csrf_exempt 
def get_data(request):
    if request.method == 'POST':
        request_data = JSONParser().parse(request)
        interval = request_data['interval']
        table_name = request_data['table_name']
        start_time = request_data['start_time']
        end_time = request_data['end_time']
        chart_data = query_chart_data(interval, table_name, start_time, end_time)
    return JsonResponse({'chart_data': chart_data}, status=status.HTTP_201_CREATED)

def index(request):
    return render(request, "builds/index.html")

def query_tables(query):
    cursor.execute(query)
    values = cursor.fetchall()
    result = []
    for item in values:
        table_name = (list(item)[0])
        if (table_name.find('candles_') >= 0):
            result.append(table_name)
    return result

def query_chart_data(interval, table_name, start_time, end_time):
    if end_time is not None:
        query = f"SELECT starttime, midpoint, vwap, upperlimit, lowerlimit FROM {table_name}"
        query += f" WHERE"
        query += f" interval = {interval} and"
        query += f" starttime >= '{start_time}' and"
        query += f" starttime <= '{end_time}'"
        query += f" ORDER BY starttime"
    else:
        query = f"SELECT starttime, midpoint, vwap, upperlimit, lowerlimit FROM {table_name}"
        query += f" WHERE"
        query += f" interval = {interval} and"
        query += f" starttime >= '{start_time}'"
        query += f" ORDER BY starttime"
    cursor.execute(query)
    values = cursor.fetchall()
    midpoint_temp = []
    vwap_temp = []
    upperlimit_temp = []
    lowerlimit_temp = []
    max_val = 0
    min_val = 0
    for item in values:
        temp_data = (list(item))   
        start_time = datetime.timestamp(temp_data[0]) * 1000
        midpoint_temp.append([start_time, temp_data[1]])
        vwap_temp.append([start_time, temp_data[2]])
        upperlimit_temp.append([start_time, temp_data[3]])
        lowerlimit_temp.append([start_time, temp_data[4]])
        try:
            if max_val == 0:
                max_val = max(temp_data[1:3])
            elif max_val < max(temp_data[1:3]):
                max_val = max(temp_data[1:3])

            if min_val == 0:
                min_val = min(temp_data[1:3])
            elif min_val > min(temp_data[1:3]):
                min_val = min(temp_data[1:3])

        except:
            pass
            
    return {
        'midpoint': midpoint_temp,
        'vwap': vwap_temp,
        'upperlimit': upperlimit_temp,
        'lowerlimit': lowerlimit_temp,
        'max': max_val,
        'min': min_val
    }
    
    
