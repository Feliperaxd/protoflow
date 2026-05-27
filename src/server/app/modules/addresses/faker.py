from faker import Faker


class FakeAddress:
    """Factory for generating fake address payloads for testing purposes."""

    _fake = Faker('pt_BR')

    @classmethod
    def get_for_create(cls, user_id: int) -> dict:
        """Generate a fake address creation payload.

        Args:
            user_id (int): The user's internal database ID.
        """
        return {
            'user_id': user_id,
            'name': cls._fake.random_element(['Casa', 'Trabalho', None]),
            'street': cls._fake.street_name(),
            'street_number': cls._fake.building_number(),
            'complement': cls._fake.random_element(['Apto 12', None]),
            'neighborhood': cls._fake.bairro(),
            'city': cls._fake.city(),
            'region': cls._fake.estado_sigla(),
            'postal_code': cls._fake.postcode(),
            'country': 'BR',
        }

    @classmethod
    def get_for_update(cls) -> dict:
        """Generate a fake address update payload."""
        return {
            'name': cls._fake.random_element(['Casa', 'Trabalho']),
            'street': cls._fake.street_name(),
            'street_number': cls._fake.building_number(),
        }
