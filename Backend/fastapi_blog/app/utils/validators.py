import re


def validate_vehicle_registration(number: str) -> bool:
    pattern = r"^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$"
    return bool(re.fullmatch(pattern, number))


def validate_phone(phone: str) -> bool:
    pattern = r"^[6-9]\d{9}$"
    return bool(re.fullmatch(pattern, phone))
