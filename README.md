# Job-Manager
A place to track your job apps.
## Main Page
The main page consists of three elements, the field search and filters, which will be touched on later, and the input dropdown. Each row of the dropdown contains all jobs which a user has input and an additional row to add a job. After adding a job, it will be automatically selected for the user to fill. The required fields, which are marked by an asterisk, are the only fields that must be filled, as they are used in other functions of the application. Every other field is relevant and useful for keeping track of information, however they are present only for the benefit of the user. 

The main page has many dynamic elements, most of which are in the job editing field. All fields are edited in place, and will only update if the content is changed. 

There are three fields with autocomplete functions.The first two are the 'Type’ and 'Status' fields will only accept input from the selected buttons, which appear when the field is clicked. Their text box area is only for consistency and doesn’t save to the database even if the text is changed. This is to reduce variability and allow for analytics to function properly.

The third field with autocomplete, ‘Field’, functions differently than the other two. The ‘Field’ field will take input from the user while giving autocomplete prompts. These prompts come from the database of fields of which other users have input. For example, if user 1 chose to input ‘Software’ into the field, there would be no prompt for it. If user 2, who is making their edits after user 1, chose to input ‘soft’ into the field, the prompt of ‘Software’ would pop up. Should user 2 click the prompt, it will fill ‘Software’ into the field and push to the database.

## Filters
The filters accordion is the second element on the main page. It contains options to restrict which jobs will appear in the jobs dropdown. There are four criteria that a user can filter by, Company, Status, Minimum Salary, and Maximum Salary. It works as one would expect a filter to work. 

The filter is also dynamic, so changes to the dropdown are shown without needing to reload the page. The company field simply filters by company name, where the input text can be anywhere in the name. The Status part is four buttons which toggle on and off when clicked. Their default state is on, as nothing would show if they all defaulted to off. The salary fields can be used together or individually. An empty Minimum Salary field is treated as zero while an empty Maximum Salary field is treated as infinity, this behavior is not shown to the user. 

## Fields Search
The field search is the third element present on the main page. As a user types into this field, they are prompted with fields related to their input. Upon clicking the button, the user is redirected to a page of companies affiliated with that field, based on other users input.

The search bar acts like the aforementioned ‘Field’ field under the ‘Main Pages’ section. However, instead of the button inputting text, it instead acts as a link. Similar to the Field' field, only fields which have been input will appear, as they look at the same table in the database. Despite similar functionality, users can not save fields using this search bar. 

## Job Lists
The jobs list is the section the user is taken to after they click a button provided by the fields search bar. This page contains a link back to the main page and all companies that are affiliated with that given field. Upon clicking a company button, the user will be taken to a new page where they can comment on the company.

The companies are compiled from all job tables based on the ‘Company’ and ‘Field’ areas. They are then listed out as clickable buttons, clicking a company button will takes users to a new page.

## Comments Section
Comments are written based on the company. Each company page has its own comments page. Comments from other users can be seen as well, think of it as a community page for those who have applied to the company and want to share their interview experience, etc.

All comments go into a single database table, comments are displayed due to the company name. They are displayed earliest to latest and are timestamped. This time stamp shows as a count of seconds, minutes, hours, days, etc. to the user, instead of a datetime. 

## Stats and Analytics
Analytics are mainly based on individual jobs and the field/sector they belong to. This page can be navigated to by clicking/entering information for a specific job on the Main Page, then clicking on the “Job Analytic” button. Once the user is navigated to this page, they can select various options that show them analytics about a specific Job or the sector they are applying for.

At the moment, we have a few analytics implemented. The first is a listing of Similar Jobs in which the user can see jobs that other users have applied to after a certain period of time has passed. This feature depends on the sector of a job and shows the similar job if the field matches, and it has been an “x” amount of days/weeks since the original user inputted the job into the table. This allows other users of the site to find more jobs to apply to while also keeping it fair for the user who originally posted the job. 

The next analytic we’ve implemented is information about the average salary of a sector. This is helpful to users who would like to know the average salary offered at similar positions in their field. This feature depends on the Salary field being populated, and goes through each job a user in the auth_user table has. If the sector a job is in matches the current job’s Field, it will be included in the Average Salary calculated at the end.

The last analytic we’ve implemented is an Average Response Rate feature that provides an estimate for how long jobs usually take to provide a response. This feature depends on the user changing the Status of a Job from “In Progress” or “Interview” to “Accepted” or “Rejected”. The time delta between the change is logged as the response time and then averaged.



