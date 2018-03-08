from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database_setup import Base, Place

# API to convert Python objects to JSON format or vice versa
import json

user = json.loads(
        open('secrets.json', 'r').read()
    )["postgresql"]["user"]
password = json.loads(
        open('secrets.json', 'r').read()
    )["postgresql"]["password"]

# Instance of create engine class and point to database we use
engine = create_engine(
    'postgresql://{user}:{password}@localhost:5432/places'.format(
        user=user,
        password=password
    )
)
# Bind the engine to the metadata of the Base class so that the
# declaratives can be accessed through a DBSession instance
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
# A DBSession() instance establishes all conversations with the database
# and represents a "staging zone" for all the objects loaded into the
# database session object. Any change made against the objects in the
# session won't be persisted into the database until you call
# session.commit(). If you're not happy about the changes, you can
# revert all of them back to the last commit by calling
# session.rollback()
db_session = DBSession()

# Adding entries to database
new_place = Place(
    name='Home',
    lat=37.402365,
    lng=-121.9275,
    description=':-)'
)
db_session.add(new_place)
db_session.commit()

new_place = Place(
    name='Scenery 2',
    lat=37.905449,
    lng=-122.573073,
    description='Park with care, do not drive off the cliff! ;)'
)
db_session.add(new_place)
db_session.commit()

new_place = Place(
    name='Philz Coffee',
    lat=37.377366,
    lng=-122.031270,
    description='The best coffee in Bay Area'
)
db_session.add(new_place)
db_session.commit()

new_place = Place(
    name='Scenery 1',
    lat=37.558997,
    lng=-122.514631,
    description='Best Ocean Road near SF'
)
db_session.add(new_place)
db_session.commit()

new_place = Place(
    name='Ocean View',
    lat=37.826564,
    lng=-122.499256,
    description='Best Ocean View near Golden Gate Bridge'
)
db_session.add(new_place)
db_session.commit() 

print("-- Finished -- Added menu items!")

# Print all the places added
places = db_session.query(Place).all()
for place in places:
    print("\n>> Place:")
    print("   ID: " + str(place.id))
    print("   name: " + place.name)
    print("   location: " + str(place.lat) + ", " + str(place.lng))
    print("   description: " + place.description)
