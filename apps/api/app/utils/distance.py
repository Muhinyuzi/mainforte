# app/utils/distance.py

from math import radians, sin, cos, sqrt, atan2


CITY_COORDS = {
    "Ville-Marie": (47.333, -79.433),
    "Rouyn-Noranda": (48.236, -79.023),
    "Témiscaming": (46.721, -79.097),
    "Notre-Dame-du-Nord": (47.600, -79.483),
    "Duhamel-Ouest": (47.333, -79.500),
}


def calculate_distance_km(lat1, lon1, lat2, lon2):
    radius = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a),
    )

    return round(radius * c, 1)


def get_city_distance_km(city_a: str, city_b: str):
    coords_a = CITY_COORDS.get(city_a)
    coords_b = CITY_COORDS.get(city_b)

    if not coords_a or not coords_b:
        return None

    return calculate_distance_km(
        coords_a[0],
        coords_a[1],
        coords_b[0],
        coords_b[1],
    )