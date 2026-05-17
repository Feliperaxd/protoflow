import re


_CNPJ_WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
_CNPJ_WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]


class InvalidCPFError(ValueError):
    def __init__(self, reason: str, cpf: str) -> None:
        super().__init__(f'{reason} | CPF: {cpf}')


class InvalidCNPJError(ValueError):
    def __init__(self, reason: str, cnpj: str) -> None:
        super().__init__(f'{reason} | CNPJ: {cnpj}')


class InvalidPhoneError(ValueError):
    def __init__(self, reason: str, phone: str) -> None:
        super().__init__(f'{reason} | Phone: {phone}')


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

        Args:
            value (str): Raw CNPJ string, formatted or unformatted.

        Returns:
            str: Normalized CNPJ containing only digits.

        Raises:
            InvalidCNPJError: If the CNPJ fails any validation step.
        """
        cnpj = re.sub(r'\D', '', value)

        if len(cnpj) != 14:
            raise InvalidCNPJError('Must have 14 digits', cnpj)

        if cnpj == cnpj[0] * 14:
            raise InvalidCNPJError('All digits are the same', cnpj)

        first_digit = Validators._calc_cnpj_digit(cnpj, _CNPJ_WEIGHTS_FIRST)
        second_digit = Validators._calc_cnpj_digit(cnpj, _CNPJ_WEIGHTS_SECOND)

        if int(cnpj[12]) != first_digit or int(cnpj[13]) != second_digit:
            raise InvalidCNPJError('Check digits do not match', cnpj)

        return cnpj

    @staticmethod
    def cpf(value: str) -> str:
        """
        Validates and normalizes a Brazilian CPF number.

        Args:
            value (str): Raw CPF string, formatted or unformatted.

        Returns:
            str: Normalized CPF containing only digits.

        Raises:
            InvalidCPFError: If the CPF fails any validation step.
        """
        cpf = re.sub(r'\D', '', value)

        if len(cpf) != 11:
            raise InvalidCPFError('Must have 11 digits', cpf)

        if cpf == cpf[0] * 11:
            raise InvalidCPFError('All digits are the same', cpf)

        total = sum(int(cpf[i]) * (10 - i) for i in range(9))
        first_digit = (total * 10 % 11) % 10

        total = sum(int(cpf[i]) * (11 - i) for i in range(10))
        second_digit = (total * 10 % 11) % 10

        if int(cpf[9]) != first_digit or int(cpf[10]) != second_digit:
            raise InvalidCPFError('Check digits do not match', cpf)

        return cpf

    @staticmethod
    def phone(value: str) -> str:
        """
        Validates and normalizes a Brazilian phone number.

        Args:
            value (str): Raw phone string, formatted or unformatted.

        Returns:
            str: Normalized phone number containing only digits.

        Raises:
            InvalidPhoneError: If the phone number fails any validation step.
        """
        phone = re.sub(r'\D', '', value)

        if len(phone) not in (10, 11):
            raise InvalidPhoneError(
                'Must have 10 digits (landline) or 11 digits (mobile)', phone
            )

        area_code = int(phone[:2])
        if not (11 <= area_code <= 99):
            raise InvalidPhoneError('Invalid area code (DDD)', phone)

        if len(phone) == 11 and phone[2] != '9':
            raise InvalidPhoneError(
                'Mobile numbers must start with 9 after the area code', phone
            )

        return phone
    