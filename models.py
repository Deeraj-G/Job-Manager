"""
This file defines the database models
"""

import datetime
import random
from py4web.utils.populate import FIRST_NAMES, LAST_NAMES, IUP
from .common import db, Field, auth
from pydal.validators import *

TESTING_USERS_NUM = 20


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None


def get_username():
    return auth.current_user.get('username') if auth.current_user else None


def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

db.define_table(
    'job',
    Field('UUID', 'reference auth_user'),
    Field('company_name'),
    Field('URL', 'string', 2048),
    Field('JUID', 'int'),
    Field('title', 'string'),
    Field('salary', 'integer'),
    Field('type', 'string'),
    Field('location', 'string'),
    Field('status', 'string'),
    Field('date_applied', 'date', default=datetime.date.today()),
    Field('notes', 'string', 512),
)
db.define_table(
    'stats',
    Field('JUID', 'reference job'),
    Field('URL', 'string', 2048),

)

db.commit()


def add_users_for_testing(num_users):
    # Test user names begin with "_".
    # Counts how many users we need to add.
    db(db.auth_user.username.startswith("_")).delete()
    num_test_users = db(db.auth_user.username.startswith("_")).count()
    num_new_users = num_users - num_test_users
    dob = datetime.date.today()
    print("Adding", num_new_users, "users.")
    for k in range(num_test_users, num_users):
        first_name = random.choice(FIRST_NAMES)
        last_name = first_name = random.choice(LAST_NAMES)
        uuid = "_%s%.2i" % (first_name.lower(), k)
        user = dict(
            uuid=uuid,
            email=first_name.lower() + "@ucsc.edu",
            first_name=first_name,
            last_name=last_name,
            dob=dob,
            password=first_name,  # To facilitate testing.
        )
        auth.register(user, send=False)
    db.commit()


# Comment out this line if you are not interested. 
add_users_for_testing(TESTING_USERS_NUM)
