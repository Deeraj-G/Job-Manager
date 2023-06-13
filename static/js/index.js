// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // lists
        rows: [],
        filtered_jobs: [],
        sim_jobs: [],
        known_types: [{type: "In Person"}, {type: "Remote"}, {type: "Hybrid"}],
        known_fields: [{field:"Art"},{field:"Science"},{field:"Math"}],
        known_statuses: [{status:"In Progress"}, {status:"Interview"}, {status:"Accepted"}, {status:"Rejected"}],
        showing_fields: [], // Dropdown options for Field field
        showing_fields_item: [], // This is the full list of Fields in the Job table when user inputs characters
        showing_status_item: [], // This is the list of Statuses allowed in the Job table
        showing_type_item: [],
        active_job: [],
		job_tags: [{name:'Company Name',id:'company'},{name:'Job Title',id:'title'},{name:'URL',id:'URL'},
				   {name:'Job Description',id:'description'},{name:'Referral',id:'referral'},
				   {name:'Salary Estimate',id:'salary'},{name:'Type',id:'type'},
				   {name:'Location',id:'location'},{name:'Status',id:'status'},
				   {name:'Date Applied',id:'date_applied'},{name: 'Field',id: 'field'},
                   {name:'Other Notes',id:'notes'}],
        avg_salary: null, // Average salary shown to user
        sector: "", // Sector that is currently selected

        // Strings - filter input
        inputField: "",
        companyFilter: "",
        statusFilter: "",
        salaryMin: "",
        salaryMax: "",
        // Strings - DB input
        company: "",
        title: "",
        url: "",
        description: "",
        referral: "",
        salary: "",
        type: "",
        location: "",
        status: "",
        date_applied: "",
        field: "",
        notes: "",
        // bool
        filter_progress: true,
        filter_int: true,
        filter_acc: true,
        filter_rej: true,
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => { e._idx = k++; });
        return a;
    };

    // Search through the Fields in the Job table and the showing_fields data
    app.search_fields = function () {
        axios.get(field_url).then(function (response) {
            let known_fields = app.vue.known_fields
            app.vue.known_fields = response.data.fields.concat(app.vue.known_fields);
            app.vue.showing_fields = app.vue.known_fields.filter((item, index, self) =>
                item.field.toLowerCase().includes(app.vue.inputField.toString().toLowerCase()) &&
                self.findIndex((elem) => elem.field === item.field) === index
            );
            app.vue.known_fields = known_fields;
            if(app.vue.inputField.length === 0){
                app.vue.showing_fields = []
            }
        });
    };

    // Autofill the searched item
    app.autofill_click = function (event, item) {
        axios.get(get_field_url, {params: {field_name: item.field}}).then(function (response) {
            window.location = response.data.url;

            app.vue.inputField = item.field
            app.vue.showing_fields = []
        });
    };

    // Search through the job.fields database for known fields
    app.search_type_status = function (row_idx, reuse) {
        if (reuse == 'S') {
            // Populate showing_status_item with the known_statuses
            app.vue.showing_status_item = app.vue.known_statuses
            // Show no status if input is empty
            if(app.vue.rows[row_idx].status.length === 0){
                app.vue.showing_status_item = []
            }
        }
        else if (reuse == 'T') {
            // Populate showing_status_item with the known_statuses
            app.vue.showing_type_item = app.vue.known_types
            // Show no status if input is empty
            if(app.vue.rows[row_idx].type.length === 0){
                app.vue.showing_type_item = []
            }
        }
    };

    // Autofill for the Status entry in the Job table
    app.autofill_type_status = function (row_idx, item, reuse) {
        if (reuse == 'S') {
            app.vue.rows[row_idx].status = item.status
            app.vue.showing_status_item = []
        }
        else if (reuse == 'T') {
            app.vue.rows[row_idx].type = item.type
            app.vue.showing_type_item = []
        }
    };

    // Search through the job.fields database for known fields
    app.search_fields_field = function (row_idx) {
        axios.get(field_url).then(function (response) {
            let known_fields = app.vue.known_fields
            app.vue.known_fields = response.data.fields.concat(app.vue.known_fields);

            app.vue.showing_fields_item = app.vue.known_fields.filter((item, index, self) =>
                item.field.toLowerCase().includes(app.vue.rows[row_idx].field.toString().toLowerCase()) &&
                self.findIndex((elem) => elem.field === item.field) === index
            );
            app.vue.known_fields = known_fields;
            console.log(app.vue.rows[row_idx].field)
            if(app.vue.rows[row_idx].field.length === 0){
                app.vue.showing_fields_item = []
            }
        });

    };

    // Autofill for the Field entry in the Job table
    app.autofill_click_field = function (row_idx, item) {
        app.vue.rows[row_idx].field = item.field
        app.vue.showing_fields_item = []
    };

    app.salary_avg = function () {
        axios.get(salary_avg_url, {params: {
            sector: app.vue.sector
        }}).then (function (response) {
            app.vue.avg_salary = response.data.salary_avg
        });
    };

    app.similar_jobs = function () {
        axios.get(similar_jobs_url, {params: {
            sector: app.vue.sector
        }}).then (function (response) {
            app.vue.sim_jobs = response.data.similar_jobs
        });
    };

    app.decorate = (a) => {
        a.map((e) => {
            e._state = { company: "clean", title: "clean", URL: "clean", description: "clean", referral: "clean", salary: "clean", type: "clean", location: "clean", status: "clean", date_applied: "clean", field: "clean", notes: "clean" };
            e._server_vals = {
                company: e.company,
                title: e.title,
                URL: e.url,
                description: e.description,
                referral: e.referral,
                salary: e.salary,
                type: e.type,
                location: e.location,
                status: e.status,
                date_applied: e.date_applied,
                field: e.field,
                notes: e.notes
            };
        });
        return a;
    };

    // Loads the current job entry
	app.load_job = function (row_item) {
        app.vue.active_job = [row_item]
    };
    app.job_filter = function () {
        app.vue.filtered_jobs = app.vue.rows
        fil_min = app.vue.salaryMin
        fil_max = app.vue.salaryMax
        if (app.vue.salaryMin.length === 0) {
            fil_min = 0
        }
        if (app.vue.salaryMax.length === 0) {
            fil_max = Infinity
        }
        app.vue.filtered_jobs = app.vue.filtered_jobs.filter((item) =>
            item.company.toLowerCase().includes(app.vue.companyFilter.toString().toLowerCase()) &&
            item.salary >= fil_min && item.salary <= fil_max &&
            ((item.status === 'In Progress' && app.vue.filter_progress) ||
            (item.status === 'Interview' && app.vue.filter_int) ||
            (item.status === 'Accepted' && app.vue.filter_acc) ||
            (item.status === 'Rejected' && app.vue.filter_rej))
        );
    };

    app.reset_filter = function () {
        app.vue.companyFilter = ''
        app.vue.filter_progress = true
        app.vue.filter_int = true
        app.vue.filter_acc = true
        app.vue.filter_rej = true
        app.vue.salaryMin = ''
        app.vue.salaryMax = ''
        app.vue.filtered_jobs = app.vue.rows
    };

    // Add a row to the jobs table
    // Based off of add_contact()
    app.add_job = function () {
        axios.post(add_job_url,
            {
                company: app.vue.company,
                title: app.vue.title,
                url: app.vue.url,
                description: app.vue.description,
                referral: app.vue.referral,
                salary: app.vue.salary,
                type: app.vue.type,
                location: app.vue.location,
                status: app.vue.status,
                date_applied: app.vue.date_applied,
                field: app.vue.field,
                notes: app.vue.notes,
                _state: { company: "clean", title: "clean", URL: "clean", description: "clean", referral: "clean", salary: "clean", type: "clean", location: "clean", status: "clean", date_applied: "clean", field: "clean", notes: "clean" },
            }).then(function (response) {
                app.vue.rows.push({
                    id: response.data.id,
                    company: app.vue.company,
                    title: app.vue.title,
                    url: app.vue.url,
                    description: app.vue.description,
                    referral: app.vue.referral,
                    salary: app.vue.salary,
                    type: app.vue.type,
                    location: app.vue.location,
                    status: app.vue.status,
                    date_applied: app.vue.date_applied,
                    field: app.vue.field,
                    notes: app.vue.notes,
                    _state: { company: "clean", title: "clean", URL: "clean", description: "clean", referral: "clean", salary: "clean", type: "clean", location: "clean", status: "clean", date_applied: "clean", field: "clean", notes: "clean" },
                    _server_vals: {
                        company: app.vue.company,
                        title: app.vue.title,
                        URL: app.vue.url,
                        description: app.vue.description,
                        referral: app.vue.referral,
                        salary: app.vue.salary,
                        type: app.vue.type,
                        location: app.vue.location,
                        status: app.vue.status,
                        date_applied: app.vue.date_applied,
                        field: app.vue.field,
                        notes: app.vue.notes
                    }
                });
                app.enumerate(app.vue.rows);
                app.reset_form();
            });
    };

    app.console = function (obj) {
        console.log(obj);
    };

    app.delete_job = function (row_idx) {
        let id = app.vue.rows[row_idx].id;
        axios.get(delete_job_url, { params: { id: id } }).then(function (response) {
            for (let i = 0; i < app.vue.rows.length; i++) {
                if (app.vue.rows[i].id === id) {
                    app.vue.rows.splice(i, 1);
                    app.enumerate(app.vue.rows);
                    break;
                }
            }
        });
    };

    app.start_edit = function (row_idx, fn) {
        app.vue.rows[row_idx]._state[fn] = "edit";
    };

    app.stop_edit = function (row_idx, fn) {
        let row = app.vue.rows[row_idx];
        if (row._state[fn] === 'edit') {
            if (row._server_vals[fn] !== row[fn]) {
                console.log(row._server_vals[fn]);
                console.log(row[fn]);
                console.log(row._state[fn]);
                row._state[fn] = "pending";
                axios.post(edit_job_url, {
                    id: row.id, field: fn, value: row[fn]
                }).then(function (response) {
                    row._state[fn] = "clean";
                    row._server_vals[fn] = row[fn];
                })
            } else {
                row._state[fn] = "clean";
            }
        }
    };
    

    app.reset_form = function () {
        app.vue.company = "",
            app.vue.title = "",
            app.vue.url = "",
            app.vue.description = "",
            app.vue.referral = "",
            app.vue.salary = "",
            app.vue.type = "",
            app.vue.location = "",
            app.vue.status = "",
            app.vue.date_applied = "",
            app.vue.field = "",
            app.vue.notes = ""
    };

    // This contains all the methods.
    app.methods = {
        add_job: app.add_job,
        delete_job: app.delete_job,
        load_job: app.load_job,
        reset_form: app.reset_form,
        start_edit: app.start_edit,
        stop_edit: app.stop_edit,
        search_fields: app.search_fields,
        search_fields_field: app.search_fields_field,
        search_type_status: app.search_type_status,
        autofill_click: app.autofill_click,
        autofill_click_field: app.autofill_click_field,
        autofill_type_status: app.autofill_type_status,
        salary_avg: app.salary_avg,
        console: app.console,
        job_filter: app.job_filter,
        reset_filter: app.reset_filter,
        similar_jobs: app.similar_jobs,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        axios.get(load_jobs_url).then(function (response) {
            console.log(response);
            app.vue.rows = app.decorate(app.enumerate(response.data.jobs));
        }).finally(() => {
            app.vue.filtered_jobs = app.vue.rows
        });
       
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
init(app);
