// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        listHidden: false,
        sim_jobs: [],
        avg_salary: null, // Average salary shown to user
        time_response: null,
        sector: "", // Sector that is currently selected
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.salary_avg = function () {
        axios.get(salary_avg_url, {params: {
            sector: app.vue.sector
        }}).then (function (response) {
            app.vue.avg_salary = response.data.salary_avg
        });
    };

    app.response_time = function () {
        axios.get(response_time_url, {params: {
            sector: app.vue.sector
        }}).then (function (response) {
            app.vue.time_response = response.data.response_time
        }).catch(function(error) {
            console.log(error);
          });;
    };

    app.similar_jobs = function () {
        axios.get(similar_jobs_url, {params: {
            sector: app.vue.sector
        }}).then (function (response) {
            app.vue.sim_jobs = response.data.similar_jobs
            if (app.vue.listHidden == false) {
                app.vue.listHidden = true
            } else if (app.vue.listHidden == true) {
                app.vue.listHidden = false
            }
            
        });
    };

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        salary_avg: app.salary_avg,
        similar_jobs: app.similar_jobs,
        response_time: app.response_time,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target4",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        app.vue.sim_jobs = app.enumerate(app.vue.sim_jobs);
        app.vue.sector = field_name;
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);