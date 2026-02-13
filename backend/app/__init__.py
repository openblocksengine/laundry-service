from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key-steamline-laundry-management-system-2026-secure')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    
    jwt = JWTManager(app)
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'msg': 'Invalid token',
            'error': str(error)
        }), 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'msg': 'Request does not contain an access token',
            'error': str(error)
        }), 401
    
    from app.routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    return app
