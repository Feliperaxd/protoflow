import re


def validate_cpf(value: str) -> str:
    """
    Validates and normalizes a Brazilian CPF number.

    Accepts formatted (e.g. '123.456.789-09') or unformatted input.
    Strips all non-digit characters before validation.

    Args:
        value (str): Raw CPF string, formatted or unformatted.

    Returns:
        str: Normalized CPF containing only digits (e.g. '12345678909').

    Raises:
        ValueError: If the CPF does not have 11 digits, consists of
            repeated digits, or fails the check digit validation.
    """

    cpf = re.sub(r'\D', '', value)

    if len(cpf) != 11:
        raise ValueError('CPF must have 11 digits.')

    if cpf == cpf[0] * 11:
        raise ValueError('CPF is invalid.')

    total = sum(int(cpf[i]) * (10 - i) for i in range(9))
    first_digit = (total * 10 % 11) % 10

    total = sum(int(cpf[i]) * (11 - i) for i in range(10))
    second_digit = (total * 10 % 11) % 10

    if int(cpf[9]) != first_digit or int(cpf[10]) != second_digit:
        raise ValueError('CPF is invalid.')

    return cpf
