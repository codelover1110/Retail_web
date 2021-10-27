import json

from flask import Flask, request, jsonify
import sqlite3
import os
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from passlib.hash import pbkdf2_sha256 as sha256
from flask_cors import cross_origin

# Init app
app = Flask(__name__)

# Application Configuration
app.config['SECRET_KEY'] = 'OrderaheadSecretKey'
app.config['JWT_SECRET_KEY'] = 'SecretSecureKy'
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']


# JwtManager object
jwt = JWTManager(app)


db_name = 'order.db'


def generate_hash(password):
    return sha256.hash(password)


def verify_hash(password, hash_):
    return sha256.verify(password, hash_)


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


# Flask maps HTTP requests to Python functions.
# The process of mapping URLs to functions is called routing.
@app.route('/', methods=['GET'])
def home():
    return "<h1>API for Order ahead</h1>"


# Log In
@app.route('/users/authenticate', methods=["POST", "OPTIONS"], strict_slashes=False)
@cross_origin()
def logIn():
    # Receives the data in JSON format in a HTTP POST request
    if not request.is_json:
        return jsonify({"status": False, "message": "Input error!"})

    content = request.get_json()
    email = content.get("email")
    password = content.get("password")

    if not (email or password):
        return jsonify({"status": False, "message": "Please input the email and password."})

    query = 'SELECT id, email, password, username, first_name, last_name, is_superuser, is_active FROM users WHERE'
    to_filter = []

    if email:
        query += ' email=? AND'
        to_filter.append(email)

    query = query[:-4] + ';'

    db_path = os.path.join('db', db_name)
    conn = sqlite3.connect(db_path)
    conn.row_factory = dict_factory
    cur = conn.cursor()

    result = cur.execute(query, to_filter).fetchone()

    if result:
        if verify_hash(password, result['password']):
            access_token = create_access_token(identity=email)
            print(result['is_active'])
            if result['is_active']:
                response = app.response_class(
                    response=json.dumps({"status": True, "message": "successfully logged in", "data": "{}".format(result['id']),
                                         "isAdmin": result['is_superuser'], "token": access_token}),
                    status=200,
                    mimetype='application/json'
                )
                return response
            else:
                response = app.response_class(
                    response=json.dumps({"status": False, "message": "Your account need to be active"}),
                    status=401,
                    mimetype='application/json'
                )
                return response
        else:
            response = app.response_class(
                response=json.dumps({"status": False, "message": "Wrong credential"}),
                status=401,
                mimetype='application/json'
            )
            return response
    else:
        return jsonify({"status": False, "message": "Email or password is not correct."})


# Register
@app.route('/users/register', methods=["POST", "OPTIONS"], strict_slashes=False)
@cross_origin()
def register():
    # Receives the data in JSON format in a HTTP POST request
    if not request.is_json:
        return jsonify({"status": False, "message": "Input error!"})

    content = request.get_json()
    username = content.get("username")
    email = content.get("email")
    password = content.get("password")

    # Save the data in db
    db_path = os.path.join('db', db_name)
    conn = sqlite3.connect(db_path)
    query = f'INSERT INTO users (username, email, password) \
              VALUES ("{username}", "{email}", "{generate_hash(password)}");'

    cur = conn.cursor()
    cur.execute(query)
    conn.commit()

    response = app.response_class(
        response=json.dumps({"status": True, "message": "successfully registered"}),
        status=200,
        mimetype='application/json'
    )
    return response


# Get the user info by id
@app.route('/getUser', methods=['GET'])
@cross_origin()
def getUserById():
    query_parameters = request.args

    id = query_parameters.get('id')

    query = 'SELECT first_name, last_name, is_active, is_superuser, role, email, username FROM users WHERE'
    to_filter = []

    if not id:
        return jsonify({"status": False, "message": "Input error!"})

    if id:
        query += ' id=? AND'
        to_filter.append(id)

    query = query[:-4] + ';'

    db_path = os.path.join('db', db_name)
    conn = sqlite3.connect(db_path)
    conn.row_factory = dict_factory
    cur = conn.cursor()

    results = cur.execute(query, to_filter).fetchone()

    return jsonify(results)


# Get all users
@app.route('/users', methods=['GET'])
@cross_origin()
def api_all():
    db_path = os.path.join('db', db_name)
    conn = sqlite3.connect(db_path)
    # returns items from the database as dictionaries rather than lists
    conn.row_factory = dict_factory
    cur = conn.cursor()
    all_users = cur.execute('SELECT first_name, last_name, username, email, is_active, is_superuser, id, role FROM users;').fetchall()

    return jsonify(all_users)


@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found</p>", 404


# A method that runs the application server.
if __name__ == "__main__":
    # Threaded option to enable multiple instances for multiple user access support
    app.run(debug=False, threaded=True, port=5000)
