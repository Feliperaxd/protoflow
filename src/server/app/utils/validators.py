import re


_CNPJ_WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
_CNPJ_WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]


class Validators:

    @staticmethod
    def _calc_cnpj_digit(cnpj: str, weights: list[int]) -> int:
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

    @staticmethod
    def cnpj(value: str) -> str:
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
            raise ValueError('CNPJ must have 14 digits!')

        if cnpj == cnpj[0] * 14:
            raise ValueError('CNPJ is invalid!')

        first_digit = Validators._calc_cnpj_digit(cnpj, _CNPJ_WEIGHTS_FIRST)
        second_digit = Validators._calc_cnpj_digit(cnpj, _CNPJ_WEIGHTS_SECOND)

        if int(cnpj[12]) != first_digit or int(cnpj[13]) != second_digit:
            raise ValueError('CNPJ is invalid!')

        return cnpj

    @staticmethod
    def cpf(value: str) -> str:
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
            raise ValueError('CPF must have 11 digits!')

        if cpf == cpf[0] * 11:
            raise ValueError('CPF is invalid!')

        total = sum(int(cpf[i]) * (10 - i) for i in range(9))
        first_digit = (total * 10 % 11) % 10

        total = sum(int(cpf[i]) * (11 - i) for i in range(10))
        second_digit = (total * 10 % 11) % 10

        if int(cpf[9]) != first_digit or int(cpf[10]) != second_digit:
            raise ValueError('CPF is invalid!')

        return cpf

    @staticmethod
    def phone(value: str) -> str:
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
            raise ValueError('Invalid area code (DDD)!')

        if len(phone) == 11 and phone[2] != '9':
            raise ValueError(
                'Mobile numbers must start with 9 after the area code!'
            )

        return phone
