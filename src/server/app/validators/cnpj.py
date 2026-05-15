import re


_CNPJ_WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
_CNPJ_WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]


def _calc_digit(cnpj: str, weights: list[int]) -> int:
    """
    Calculates a single CNPJ check digit.

    Args:
        cnpj (str): CNPJ string containing only digits.
        weights (list[int]): Multiplication weights for each digit position.

    Returns:
        int: Calculated check digit (0-9).
    """

    total = sum(int(cnpj[i]) * weights[i] for i in range(len(weights)))
    remainder = total % 11
    return 0 if remainder < 2 else 11 - remainder


def validate_cnpj(value: str) -> str:
    """
    Validates and normalizes a Brazilian CNPJ number.

    Accepts formatted (e.g. '12.345.678/0001-90') or unformatted input.
    Strips all non-digit characters before validation.

    Args:
        value (str): Raw CNPJ string, formatted or unformatted.

    Returns:
        str: Normalized CNPJ containing only digits (e.g. '12345678000190').

    Raises:
        ValueError: If the CNPJ does not have 14 digits, consists of
            repeated digits, or fails the check digit validation.
    """

    cnpj = re.sub(r'\D', '', value)

    if len(cnpj) != 14:
        raise ValueError('CNPJ must have 14 digits.')

    if cnpj == cnpj[0] * 14:
        raise ValueError('CNPJ is invalid.')

    first_digit = _calc_digit(cnpj, _CNPJ_WEIGHTS_FIRST)
    second_digit = _calc_digit(cnpj, _CNPJ_WEIGHTS_SECOND)

    if int(cnpj[12]) != first_digit or int(cnpj[13]) != second_digit:
        raise ValueError('CNPJ is invalid.')

    return cnpj
