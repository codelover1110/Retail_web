import json

from flask import Flask, request, jsonify
import os
import common
from controller import user_controller, link_controller
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from flask_cors import cross_origin
from flask_mail import Mail, Message

import smtplib
from smtp_client import send_email
from smtp_server import SMTPServer

LOCAL = True
# Init app
app = Flask(__name__)

mail_settings = {
    "MAIL_SERVER": 'smtp.gmail.com',
    "MAIL_PORT": 465,
    "MAIL_USE_TLS": False,
    "MAIL_USE_SSL": True,
    "MAIL_USERNAME": 'bigmlpiter@gmail.com',
    "MAIL_PASSWORD": 'lwkxryjyflksuwni'
}

app.config.update(mail_settings)
mail = Mail(app)


# Application Configuration
SENDER_EMAIL = os.getenv('SEND_EMAIL', 'code.lover1110@gmx.com')
# app.config['MAIL_SERVER'] = os.getenv('EMAIL_HOST', 'smtp.mailgun.org')
# app.config['MAIL_PORT'] = int(os.getenv('EMAIL_PORT', 587))
# app.config['MAIL_USERNAME'] = os.getenv('EMAIL_HOST_USER', 'postmaster@violetteam.com')
# app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_HOST_PASSWORD', '0f219f465ea3d17caa802d481f913aa0-156db0f1-19949148')
# app.config['MAIL_USE_TLS'] = os.getenv('EMAIL_USE_TLS', True)
# app.config['MAIL_USE_SSL'] = os.getenv('EMAIL_USE_SSL', False)

app.config['SECRET_KEY'] = 'OrderaheadSecretKey'
app.config['JWT_SECRET_KEY'] = 'SecretSecureKy'
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']

# JwtManager object
jwt = JWTManager(app)
# create an instance of the Mail class
mail = Mail(app)


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
    # If true, do verify
    confirm = content.get("confirm")

    if not (email or password):
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Please input the email and password."}),
            status=401,
            mimetype='application/json'
        )
        return response

    result = user_controller.getUserByEmail(email)

    if result:
        if common.verify_hash(password, result['password']):
            if result['is_active']:
                # Do 2mfa
                if confirm:
                    verif_code = common.get_verification_code()
                    user_controller.updateVerificatonCOdeById(verif_code, result['id'])

                    verif_message = "Please confirm your email to log in."
                    # MFA with Email
                    if result['mfa'] == 'email':
                        msg = Message('Welcome to Order Ahead', sender=SENDER_EMAIL, recipients=email)
                        msg.body = "Verification code:\n {}".format(verif_code)
                        if not LOCAL:
                            mail.send(msg)

                        else:
                            # server = smtplib.SMTP("localhost", 10255)
                            # server.sendmail(SENDER_EMAIL, [email], msg.as_string())
                            # server.quit()

                            msg = Message(subject="Welcome to Order ahead",
                                          sender=SENDER_EMAIL,
                                          recipients=[email],  # replace with your email for testing
                                          body="Verification code:\n {}".format(verif_code))

                            mail.send(msg)

                    # MFA with phone
                    else:
                        verif_message = "Please confirm your phone to log in."
                        print('Sending the sms using Twilio')

                    access_token = create_access_token(identity=email)
                    response = app.response_class(
                        response=json.dumps(
                            {"status": False, "message": verif_message}),
                        status=200,
                        mimetype='application/json'
                    )
                    return response

                else:
                    access_token = create_access_token(identity=email)
                    response = app.response_class(
                        response=json.dumps(
                            {"status": True, "message": "successfully logged in", "data": "{}".format(result['id']),
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
        response = app.response_class(
            response=json.dumps(
                {"status": False, "message": "Email or password is not correct."}),
            status=401,
            mimetype='application/json'
        )
        return response


# Register
@app.route('/users/register', methods=["POST", "OPTIONS"], strict_slashes=False)
@cross_origin()
def register():
    # Receives the data in JSON format in a HTTP POST request
    if not request.is_json:
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    content = request.get_json()
    code = content.get("code")
    username = content.get("username")
    email = content.get("email")
    password = content.get("password")

    if not (username or email or password or code):
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    role_info = link_controller.getLinkByCode(code)

    if not role_info:
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Invalid Access"}),
            status=404,
            mimetype='application/json'
        )
        return response

    user_controller.saveUserByUsernameAndEmailAndPassword(username, email, password, role_info['level'], role_info['role'])

    response = app.response_class(
        response=json.dumps({"status": True, "message": "successfully registered"}),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route('/users/forgotPasswordToConfirmEmail', methods=["POST"], strict_slashes=False)
@cross_origin()
def forgotPasswordToConfirmEmail():
    # Receives the data in JSON format in a HTTP POST request
    if not request.is_json:
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    content = request.get_json()
    email = content.get("email")

    if not email:
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    result = user_controller.getUserByEmail(email)
    if result:
        verif_code = common.get_verification_code()
        user_controller.updateVerificatonCOdeById(verif_code, result['id'])

        msg = Message('Welcome to Order Ahead', sender=SENDER_EMAIL, recipients=email)
        msg.body = "If you forgot the password, please input the verification code:\n {}".format(verif_code)
        if not LOCAL:
            mail.send(msg)
        else:
            # server = smtplib.SMTP("localhost", 10255)
            # server.sendmail(SENDER_EMAIL, [email], msg.as_string())
            # server.quit()
            # server = SMTPServer()
            # server.start()
            # try:
            #     send_email(SENDER_EMAIL, email, "If you forgot the password, please input the verification code:\n {}".format(verif_code))
            # finally:
            #     server.stop()
            msg = Message(subject="Welcome to Order ahead",
                          sender=SENDER_EMAIL,
                          recipients=[email],  # replace with your email for testing
                          body="If you forgot the password, please input the verification code:\n {}".format(verif_code))

            mail.send(msg)

        response = app.response_class(
            response=json.dumps({"status": True}),
            status=200,
            mimetype='application/json'
        )
        return response
    else:
        response = app.response_class(
            response=json.dumps({"status": False}),
            status=404,
            mimetype='application/json'
        )
        return response


@app.route('/users/forgotPassword', methods=["POST"], strict_slashes=False)
@cross_origin()
def forgotPassword():
    # Receives the data in JSON format in a HTTP POST request
    if not request.is_json:
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    content = request.get_json()
    code = content.get("code")
    email = content.get("email")
    password = content.get("password")

    if not (email or password or code):
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    result = user_controller.getUserByEmail(email)

    if not result or result['verif_code'] != code:
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Email or Verification code is incorrect"}),
            status=404,
            mimetype='application/json'
        )
        return response

    user_controller.updatePasswordByEmail(email=email, password=password)

    response = app.response_class(
        response=json.dumps({"status": True, "message": "successfully registered"}),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route('/users/verify', methods=["GET"], strict_slashes=False)
@cross_origin()
def verifyCode():
    query_parameters = request.args

    email = query_parameters.get('email')
    verifyCode = query_parameters.get('verifyCode')

    if not (email or verifyCode):
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    result = user_controller.getUserByEmail(email)

    if result and result['verif_code'] == verifyCode:
        response = app.response_class(
            response=json.dumps(
                {"status": True, "message": "verified"}),
            status=200,
            mimetype='application/json'
        )
        return response
    else:
        response = app.response_class(
            response=json.dumps(
                {"status": False, "message": "wrong code"}),
            status=401,
            mimetype='application/json'
        )
        return response


# Get the user info by id
@app.route('/getUser', methods=['GET'])
@cross_origin()
def getUserById():
    query_parameters = request.args

    id = query_parameters.get('id')

    if not id:
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    results = user_controller.getUserById(id)

    return jsonify(results)


# Get all users
@app.route('/users', methods=['GET'])
@cross_origin()
def users_all():

    return jsonify(user_controller.getAllUsers())


# Get update profile(first_name, last_name, phone_number)
@app.route('/users/<int:update_id>',  methods=['PUT'])
@cross_origin()
def update_entry(update_id):

    content = request.get_json()
    first_name = content.get("first_name")
    last_name = content.get("last_name")
    phone_number = content.get("phone_number")

    update_id = int(update_id)

    if not (update_id or first_name or last_name or phone_number):
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    user_controller.updateNameAndPhoneById(first_name, last_name, phone_number, update_id)

    response = app.response_class(
        response=json.dumps({"status": True, "message": "successfully updated"}),
        status=200,
        mimetype='application/json'
    )
    return response


# Get update profile(first_name, last_name, phone_number, active and so on...)
@app.route('/admin/users/<int:update_id>',  methods=['PUT'])
@cross_origin()
def update_for_admin(update_id):

    content = request.get_json()
    first_name = content.get("first_name")
    last_name = content.get("last_name")
    phone_number = content.get("phone_number")
    is_active = content.get("is_active")
    update_id = int(update_id)

    if not (update_id or first_name or last_name or phone_number or is_active):
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    user_controller.updateNameAndPhoneAndActiveById(first_name, last_name, phone_number, is_active, update_id)

    response = app.response_class(
        response=json.dumps({"status": True, "message": "successfully updated"}),
        status=200,
        mimetype='application/json'
    )
    return response


# Get update profile(MFA)
@app.route('/updateMfa/<int:update_id>',  methods=['PUT'])
@cross_origin()
def update_mfa(update_id):

    content = request.get_json()
    mfa = content.get("mfa")
    update_id = int(update_id)

    if not (update_id or mfa):
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    user_controller.updateMFAById(mfa, update_id)

    response = app.response_class(
        response=json.dumps({"status": True, "message": "successfully updated"}),
        status=200,
        mimetype='application/json'
    )
    return response


# Update new password
@app.route('/users/updatePassword/<int:update_id>',  methods=['PUT'])
@cross_origin()
def update_new_password(update_id):

    content = request.get_json()
    oldPassword = content.get("oldPassword")
    password = content.get("password")

    update_id = int(update_id)

    if not (update_id or oldPassword or password):
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Input error!"}),
            status=404,
            mimetype='application/json'
        )
        return response

    result = user_controller.getUserById(update_id)

    if not result:
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Not found the user"}),
            status=404,
            mimetype='application/json'
        )
        return response

    if common.verify_hash(oldPassword, result['password']):
        user_controller.updatePasswordByEmail(email=result['email'], password=password)
        response = app.response_class(
            response=json.dumps({"status": True, "message": "successfully new password was updated"}),
            status=200,
            mimetype='application/json'
        )
        return response
    else:
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Password is incorrect."}),
            status=404,
            mimetype='application/json'
        )
        return response


# Delete the account
@app.route('/users/<int:delete_id>',  methods=['DELETE'])
@cross_origin()
def delete_account(delete_id):

    delete_id = int(delete_id)

    if not (delete_id):
        return jsonify({"status": False, "message": "Input error!"})

    user_controller.deleteAccount(delete_id)

    response = app.response_class(
        response=json.dumps({"status": True, "message": "successfully deleted"}),
        status=200,
        mimetype='application/json'
    )
    return response


# Create Link
@app.route('/link/create', methods=["POST"], strict_slashes=False)
@cross_origin()
def createLink():
    # Receives the data in JSON format in a HTTP POST request
    if not request.is_json:
        return jsonify({"status": False, "message": "Input error!"})

    content = request.get_json()
    level = content.get("level")
    label = content.get("label")

    if not (level, label):
        return jsonify({"status": False, "message": "Input error!"})

    link_controller.saveLinkByLevelAndLabel(level, label)

    response = app.response_class(
        response=json.dumps({"status": True, "message": "successfully created"}),
        status=200,
        mimetype='application/json'
    )
    return response


# Get all users
@app.route('/links', methods=['GET'])
@cross_origin()
def links_all():

    return jsonify(link_controller.getAllLinks())


# Create Link
@app.route('/links/send', methods=["POST"], strict_slashes=False)
@cross_origin()
def sendLink():
    # Receives the data in JSON format in a HTTP POST request
    if not request.is_json:
        return jsonify({"status": False, "message": "Input error!"})

    content = request.get_json()

    print(content)

    code = content.get("code")
    label = content.get("label")
    level = content.get("level")
    sendEmail = content.get("sendEmail")

    if not (level, label, code, sendEmail):
        return jsonify({"status": False, "message": "Input error!"})

    msg = Message('Welcome to Order Ahead', sender=SENDER_EMAIL, recipients=sendEmail)
    msg.body = "Please input the following URL to sign up:\n " + code
    if not LOCAL:
        mail.send(msg)
    else:
        # server = smtplib.SMTP("localhost", 10255)
        # server.sendmail(SENDER_EMAIL, [sendEmail], msg.as_string())
        # server.quit()
        msg = Message(subject="Welcome to Order ahead",
                      sender=SENDER_EMAIL,
                      recipients=[sendEmail],  # replace with your email for testing
                      body="Please input the following URL to sign up:\n " + code)

        mail.send(msg)

    response = app.response_class(
        response=json.dumps({"status": True, "message": "successfully sent"}),
        status=200,
        mimetype='application/json'
    )
    return response


# Get the user info by id
@app.route('/confirmCodeBeforeSignup', methods=['GET'])
@cross_origin()
def confirmCodeBeforeSignup():
    query_parameters = request.args

    code = query_parameters.get('code')

    if not code:
        return jsonify({"status": False, "message": "Input error!"})

    result = link_controller.getLinkByCode(code)

    if result:
        return jsonify(result)
    else:
        response = app.response_class(
            response=json.dumps({"status": False, "message": "Not found"}),
            status=404,
            mimetype='application/json'
        )
        return response


@app.errorhandler(404)
def page_not_found(e):
    return "<h1>404</h1><p>The resource could not be found</p>", 404


# A method that runs the application server.
if __name__ == "__main__":
    # Threaded option to enable multiple instances for multiple user access support
    app.run(debug=False, threaded=True, port=os.getenv('PORT'))
