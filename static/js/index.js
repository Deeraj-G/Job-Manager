// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        rows: [],
        known_fields: [{field:"Art"},{field:"Science"},{field:"Math"}],
        showing_fields: [],
		active_job: [],
		job_tags: [{name:'Company Name',id:'company'},{name:'Job Title',id:'title'},{name:'URL',id:'URL'},
				   {name:'Job Description',id:'description'},{name:'Referral',id:'referral'},
				   {name:'Salary Estimate',id:'salary'},{name:'Type',id:'type'},
				   {name:'Location',id:'location'},{name:'Status',id:'status'},
				   {name:'Date Applied',id:'date_applied'},{name: 'Field',id: 'field'},
                   {name:'Other Notes',id:'notes'}],
        inputField:"",
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
        // True if dropdown is clicked
        visible: true,
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => { e._idx = k++; });
        return a;
    };

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

    app.autofill_click = function (event, item) {
        app.vue.inputField = item.field
        app.vue.showing_fields = []
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

	app.load_job = function (row_item) {
        app.vue.active_job = [row_item]
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
                }).then(function (result) {
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
        reset_form: app.reset_form,
        start_edit: app.start_edit,
        stop_edit: app.stop_edit,
        search_fields: app.search_fields,
        autofill_click: app.autofill_click,
        load_job: app.load_job
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
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
init(app);
