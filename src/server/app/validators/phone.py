import re


def validate_phone(value: str) -> str:
    """
    Validates and normalizes a Brazilian phone number.

    Accepts formatted (e.g. '(47) 99999-9999') or unformatted input.
    Strips all non-digit characters before validation.
    Supports landlines (10 digits) and mobile numbers (11 digits).

    Args:
        value (str): Raw phone string, formatted or unformatted.

    Returns:
        str: Normalized phone number containing only digits
            (e.g. '47999999999').

    Raises:
        ValueError: If the number does not have 10 or 11 digits,
            has an invalid area code (DDD), or if an 11-digit number
            does not start with 9 after the area code.
    """

    phone = re.sub(r'\D', '', value)

    if len(phone) not in (10, 11):
        raise ValueError(
            'Phone number must have 10 digits (landline) '
            'or 11 digits (mobile).'
        )

    area_code = int(phone[:2])
    if not (11 <= area_code <= 99):
        raise ValueError('Invalid area code (DDD).')

    if len(phone) == 11 and phone[2] != '9':
        raise ValueError('Mobile numbers must start with 9 after the area code.')

    return phone
