// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        companies: [],
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.get_companies = function (field_name) {
        axios.get(get_companies_url, {params: {field_name: field_name}}).then(function (response) {
            app.vue.companies = response.data.companies;
        });
    };

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        get_companies: app.get_companies,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target2",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        app.vue.companies = app.enumerate(app.vue.companies);
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);