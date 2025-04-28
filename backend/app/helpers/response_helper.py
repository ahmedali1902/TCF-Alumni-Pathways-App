from flask import jsonify


def format_response(success: bool, message: str, data: dict = None):
    response = {
        "success": success,
        "message": message,
        "data": data if data is not None else None,
    }
    return jsonify(response)
