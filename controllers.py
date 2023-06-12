"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

import datetime
import random
import time

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_id, get_time, get_date

url_signer = URLSigner(session)

# Some constants.
MAX_RETURNED_USERS = 20  # Our searches do not return more than 20 users.
MAX_RESULTS = 20  # Maximum number of returned meows.


@action('index')
@action.uses('index.html', db, auth.user, url_signer)
def index():
    return dict(
        # COMPLETE: return here any signed URLs you need.
        load_jobs_url=URL('get_jobs', signer=url_signer),
        add_job_url=URL('add_job', signer=url_signer),
        delete_job_url=URL('delete_job', signer=url_signer),
        edit_job_url=URL('edit_job', signer=url_signer),
        field_url=URL('field', signer=url_signer),
    )


@action("get_jobs")
@action.uses(db, auth.user, url_signer.verify())
def get_jobs():
    # assert db.auth_user.id == auth.user_id
    jobs = db(db.job.auth_user_id == auth.user_id).select().as_list()
    return dict(jobs=jobs)


@action('add_job', method=["POST"])
@action.uses(db, auth.user, url_signer)
def add_job(): 
    id = db.job.insert(
        company=request.json.get('company'),
        title=request.json.get('title'),
        url=request.json.get('url'),
        description=request.json.get('description'),
        referral=request.json.get('referral'),
        salary=request.json.get('salary'),
        type=request.json.get('type'),
        location=request.json.get('location'),
        status=request.json.get('status'),
        date_applied=request.json.get('date_applied'),
        field=request.json.get('field'),
        notes=request.json.get('notes'),
    )
    
    return dict(id=id)


@action('edit_job', method=["POST"])
@action.uses(db, auth.user, url_signer.verify())
def edit_job():
    id = request.json.get("id")
    field = request.json.get('field')
    value = request.json.get('value')
    
    check = db(db.field.job_id == id).select().as_list()
    
    db(db.job.id == id).update(**{field: value})
  
    if field == 'field' and len(check) == 0:
        db.field.insert(job_id=id, name=value)
    elif field == 'field' and len(check) > 0:
        db(db.field.job_id == id).update(**{'name': value})

    time.sleep(1)
    return "ok"


@action('delete_job')
@action.uses(url_signer.verify(), db)
def delete_job():
    id = request.params.get('id')
    assert id is not None
    db(db.job.id == id).delete()
    return "ok"

@action("field")
@action.uses(db, auth.user, url_signer.verify())
def field():
    fields = []
    
    field_names = db(db.job.field).select(db.job.field, distinct=True).as_list()
    
    for name in field_names:
        fields.append(name) 
    
    return dict(fields=fields)

@action('job_analytics')
@action.uses('job_analytics.html', auth.user, url_signer)
def job_analytics():
    return dict()