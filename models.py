"""
This file defines the database models
"""

import datetime
import random
from py4web.utils.populate import FIRST_NAMES, LAST_NAMES, IUP
from .common import db, Field, auth
from pydal.validators import *

TESTING_USERS_NUM = 20
TESTING_JOB_NUM = 20

AVAILIBLE_FIELDS = {
    "Food Service": [["Entry Level",3]],
    "Physics": [["Mathmatics",3],["Natural Science",2],["Astronomy",1]],
    "Computer Science": [["Data Science",3],["Information Technology",2],["Computer Engineering",1]],
    "Computer Engineering": [["Robotics",3],["Electrical Engineering",2],[]],
    "English": [["Writing",3],["Teaching",2]],
    "Mathmatics": [["Teaching",0],["",0],["",0]],
    "":[["",0],["",0],["",0]],
}

def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None


def get_id():
    return auth.current_user.get('id') if auth.current_user else None


def get_time():
    return datetime.datetime.utcnow()


def get_date():
    return datetime.date.today()

def get_username():
    return auth.current_user.get('username') if auth.current_user else None

### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

db.define_table(
    'job',
    Field('auth_user_id', "reference auth_user", default=lambda: auth.user_id, writable=False,readable=False),
    Field('company', 'string', notnull=True),
    Field('title', 'string', notnull=True),
    Field('req_id', 'string'),
    Field('URL', 'string', 2048),
    Field('description', 'text'), # 'text' datatype allows for 32768 characters compared to string 512 characters
    Field('referral', 'string'),
    Field('salary', 'integer'),
    Field('type', 'string'),
    Field('location', 'string'),
    Field('status', 'string', default='In Progress', notnull=True),
    Field('date_applied', 'string', requires = IS_DATE(format=('%m-%d-%Y'), error_message='must be MM-DD-YYYY')),
    Field('field', 'string', notnull=True),
    Field('notes', 'text'),
    Field('time_entered', default=datetime.datetime.utcnow())
)

db.define_table(
    'stats',
    Field('job_id', 'reference job'),
    Field('success_rate'), # Pull from Status in Jobs table
    Field('apply_counter'), # Counter for how many people applied to a job
    Field('display_time'), # Pulls from time_entered and status in Jobs table, should wait two weeks and then show the inputted URLs on Similar Jobs page
    Field('salary_range'), # Pulls from Salary and Field in jobs table, average the salaries. Up to implementation
    Field('similar_jobs'), # Up to implementation
)
db.define_table(
    'field',
    Field('job_id', 'reference job'),
    Field('name', 'string'),
)

db.define_table('comment',
                Field('author', 'reference auth_user', default=lambda: auth.user_id),
                Field('name', default=get_username),
                Field('company'),
                Field('timestamp', 'datetime', default=get_time),
                Field('content'),
)

db.job.id.readable = db.job.id.writable = False
db.job.time_entered.readable = db.job.time_entered.writable = False # System logs this for internal use
db.stats.id.readable = db.stats.id.writable = False
db.field.id.readable = db.field.id.writable = False
db.comment.id.readable = db.comment.id.writable = False
db.comment.author.readable = db.comment.author.writable = False




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
            email=first_name.lower() + "@ucsc.edu",
            first_name=first_name,
            last_name=last_name,
            dob=dob,
            password=first_name,  # To facilitate testing.
        )
        auth.register(user, send=False)
    db.commit()


def add_jobs_to_users_for_testing(num_jobs):
    # Get list of test users
    test_users = db(db.auth_user.username.startswith("_")).as_list()
    # Clear out test user's jobs if they have them
    for user in test_users:
            db(db.job.UUID == user["id"]).delete()
            
    print("Adding", num_jobs, "jobs.")
    for k in range(num_jobs):
        first_name = random.choice(FIRST_NAMES)
        last_name = first_name = random.choice(LAST_NAMES)
        uuid = "_%s%.2i" % (first_name.lower(), k)
        user = dict(
            email=first_name.lower() + "@ucsc.edu",
            first_name=first_name,
            last_name=last_name,
            dob=dob,
            password=first_name,  # To facilitate testing.
        )
        auth.register(user, send=False)
    db.commit()

def add_fields(num_jobs):
    for f in AVAILIBLE_FIELDS:
        db.field.insert
# Comment out this line if you are not interested. 
add_users_for_testing(TESTING_USERS_NUM)
#add_jobs_to_users_for_testing(TESTING_JOB_NUM)
