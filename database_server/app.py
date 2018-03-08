# To use Flask framework
from flask import Flask
# To send JSON format messages
from flask import jsonify
# API to convert Python objects to JSON format or vice versa
import json

# To use SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# To use the tables classes we setup in our database
from database_setup import Base, Place

# To get os variables
# Used to append the url_for link with modified time as extension
# This is to get dynamic loading of url_for while Flask renders templates
import os

from flask_cors import CORS


# First set Flask app
app = Flask(__name__)
CORS(app)

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

# Database session
DBSession = sessionmaker(bind=engine)
db_session = DBSession()

# Places (JSON)
@app.route('/places/json', methods=['GET'])
def placesJSON():
    '''All Restaurants in JSON'''
    # Get all places
    places = db_session.query(Place)

    # Found Place table
    if places:
        return jsonify(Places=[place.serialize for place in places])

    return 'Could not retrieve places'

# Start server when this file is run
if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=8000)