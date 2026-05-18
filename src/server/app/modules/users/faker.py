from faker import Faker

from app.modules.users.enums import UserDocumentType, UserRole


class FakeUser:
    """Factory for generating fake user payloads for testing purposes."""

    _fake = Faker('pt_BR')

    @classmethod
    def get_for_create(cls) -> dict:
        """Generate a fake user creation payload."""
        document_type = cls._fake.random_element(list(UserDocumentType))

        return {
            'name': cls._fake.name(),
            'phone': cls._fake.msisdn()[3:],
            'email': cls._fake.email(),
            'password': cls._password(),
            'document_type': document_type,
            'document_number': cls._document_number(document_type),
            'role': cls._fake.random_element([UserRole.CUSTOMER, UserRole.SUPPLIER]),
            'bio': cls._fake.sentence(nb_words=8),
        }

    @classmethod
    def get_for_update(cls) -> dict:
        """Generate a fake user update payload."""
        return {
            'name': cls._fake.name(),
            'phone': cls._fake.cellphone_number(),
            'bio': cls._fake.sentence(nb_words=8),
        }

    @classmethod
    def _document_number(cls, document_type: UserDocumentType) -> str:
        """Generate a valid document number based on the document type."""
        if document_type == UserDocumentType.CPF:
            return cls._fake.cpf()

        return cls._fake.cnpj()

    @classmethod
    def _password(cls) -> str:
        """Generate a random valid password."""
        lower = cls._fake.random_letter().lower()
        upper = cls._fake.random_letter().upper()
        digit = cls._fake.random_digit()
        special = cls._fake.random_element(["@", "#", "$", "!", "%"])
        rest = cls._fake.password(length=8, special_chars=False)

        chars = list(f"{lower}{upper}{digit}{special}{rest}")
        cls._fake.random.shuffle(chars)

        return "".join(chars)
