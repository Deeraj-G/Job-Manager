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
from statistics import mean
from datetime import datetime, timedelta
from datetime import datetime

url_signer = URLSigner(session)

# Some constants.
MAX_RETURNED_USERS = 20  # Our searches do not return more than 20 users.
MAX_RESULTS = 20  # Maximum number of returned meows.


"""----------------------------------------------------------------------------------------"""
# For index.html

@action('index')
@action.uses('index.html', db, auth.user, url_signer)
def index():
    return dict(
        load_jobs_url=URL('get_jobs', signer=url_signer),
        add_job_url=URL('add_job', signer=url_signer),
        delete_job_url=URL('delete_job', signer=url_signer),
        edit_job_url=URL('edit_job', signer=url_signer),
        field_url=URL('field', signer=url_signer),
        get_field_url=URL('get_field_url', signer=url_signer),
        get_analytics_url=URL('get_analytics_url', signer=url_signer),
        url_signer=url_signer,
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
    time_entered = datetime.utcnow()
    id = db.job.insert(
        company=request.json.get('company'),
        title=request.json.get('title'),
        req_id=request.json.get('req_id'),
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
        time_entered=time_entered,
    )
    
    return dict(id=id, time_entered=time_entered)


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

@action('get_field_url')
@action.uses(db, url_signer, url_signer.verify()) 
def get_field_url():
    field_name = request.params.get ('field_name')
    return dict (url=URL('show_field_companies', field_name, signer=url_signer))

@action('get_analytics_url')
@action.uses(db, url_signer, url_signer.verify()) 
def get_analytics_url():
    field_name = request.params.get ('field_name')
    return dict (url=URL('job_analytics', field_name, signer=url_signer))

"""----------------------------------------------------------------------------------------"""
# For job_analytics.html

@action('job_analytics/<field_name>')
@action.uses("job_analytics.html", db, url_signer.verify())
def job_analytics(field_name):
    return dict(
        field_name=field_name,    
        load_jobs_url=URL('get_jobs', signer=url_signer),
        salary_avg_url=URL('salary_avg', signer=url_signer),
        similar_jobs_url=URL('similar_jobs', signer=url_signer),
        response_time_url=URL('response_time', signer=url_signer),
    )

@action('similar_jobs', method=["GET"])
@action.uses(db, auth.user, url_signer.verify())
def similar_jobs():
    sector = request.params.get('sector')
    similar_jobs = []
    # Go through each user in the auth_user table
    for user in db(db.auth_user.id).select(db.auth_user.id).as_list():
        # Go through each job a user holds
        for job in db(db.job.auth_user_id == user['id']).select().as_list():
            date = datetime.strptime(job['time_entered'], '%Y-%m-%d %H:%M:%S.%f')
            delta = (date + timedelta(seconds=60))
            try:
                # Check if it's been long enough since the original user inputted the job
                if (job['field'] == sector) and (delta <= datetime.utcnow()):
                    similar_jobs.append(job)
            except:
                pass
    
    return dict(similar_jobs=similar_jobs)


@action('salary_avg', method=["GET"])
@action.uses(db, auth.user, url_signer.verify())
def salary_avg():
    sector = request.params.get('sector')
    salary_avg = 0
    counter = 0
    # Go through each user in the auth_user table
    for user in db(db.auth_user.id).select(db.auth_user.id).as_list():
        # Go through each job a user holds
        for job in db(db.job.auth_user_id == user['id']).select().as_list():
            # Find the Average Salary of specified Sector
            if job['field'] == sector:
                try:
                    salary_avg += job['salary']
                    counter += 1
                except:
                    pass
    
    # Calculate the Average
    salary_avg //= counter
    return dict(salary_avg=salary_avg)

@action('response_time', method=["GET"])
@action.uses(db, auth.user, url_signer.verify())
def response_time():
    user_id = auth.current_user.get('id')
    job = db(db.job.auth_user_id == user_id).select().first()
    time_entered_str = job.time_entered
    time_format = "%Y-%m-%d %H:%M:%S.%f"
    time_entered = datetime.strptime(time_entered_str, time_format)

    current_time = datetime.utcnow()
    duration = current_time - time_entered
    positive_duration = abs(duration)
    seconds = positive_duration.total_seconds()
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    formatted_duration = f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    return dict(response_time=formatted_duration)

"""----------------------------------------------------------------------------------------"""
# For show_field_companies.html

@action('show_field_companies/<field_name>')
@action.uses("show_field_companies.html", db, url_signer.verify())
def show_field_companies(field_name):
    return dict(
        field_name=field_name,
        get_companies_url=URL('get_companies', signer=url_signer),
        get_comments_url_url=URL('get_comments_url', signer=url_signer),             
    )
    
@action("get_companies")
@action.uses(db, auth.user, url_signer.verify())
def get_companies():
    all_companies = db(db.job.field == request.params.get('field_name')).select('company').as_list()
    
    companies = list(set(company["_extra"]["company"] for company in all_companies))
    
    return dict(companies=companies)

@action('get_comments_url')
@action.uses(db, url_signer, url_signer.verify()) 
def get_comments_url():
    company_name = request.params.get ('company_name')
    field_name = request.params.get('field_name')
    return dict (url=URL('comments', field_name, company_name, signer=url_signer))

"""----------------------------------------------------------------------------------------"""
# For comments.html

@action('comments/<field_name>/<company_name>')
@action.uses("comments.html", db, url_signer.verify())
def comments(field_name, company_name):
    return dict(
        company_name=company_name,
        field_name=field_name,
        publish_url=URL('publish', signer=url_signer), 
        get_comments_url=URL('get_comments', signer=url_signer),
        get_back_url_url=URL('get_back_url', signer=url_signer),            
    )

@action("publish", method="POST")
@action.uses(db, auth.user, url_signer.verify())
def publish(): 
    comment_message = request.json.get('comment_message')
    if len(comment_message) != 0:
        db.comment.insert(content = comment_message,
                          company = request.json.get('company_name'),
                          timestamp=get_time())
    return "ok"

@action("get_comments")
@action.uses(db, auth.user, url_signer.verify())
def get_comments():
    company_name = request.params.get('company_name')
    comments = db(db.comment.company == company_name).select(orderby=~db.comment.timestamp).as_list()
    
    return dict(comments=comments)

@action('get_back_url')
@action.uses(db, url_signer, url_signer.verify()) 
def get_back_url():
    field_name = request.params.get ('field_name')
    return dict (url=URL('show_field_companies', field_name, signer=url_signer))