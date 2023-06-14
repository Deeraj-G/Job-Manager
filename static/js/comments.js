// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        comments: [],
        comment_query: "",

    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.publish = function () {
        axios.post(publish_url, {comment_message: app.vue.comment_query, company_name: company_name}).then(function () {
            app.vue.comment_query = ""
            app.get_comments(company_name)
        });
    }

    app.get_comments = function () {
        axios.get(get_comments_url, {params: {company_name: company_name}}).then(function (response) {
            app.vue.comments = app.enumerate(response.data.comments);
        }).finally(() => {
            app.vue.comments.forEach(element => element.timestamp = Sugar.Date(element.timestamp + "Z").relative());
        });
    }

    app.get_back_url = function (field_name) {
        axios.get(get_back_url_url, {params: {field_name: field_name}}).then(function (response) {
            window.location = response.data.url;
        });
    }

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        publish: app.publish,
        get_comments: app.get_comments,
        get_back_url: app.get_back_url,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target3",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        app.vue.comments = []
        app.vue.comment_query = ""
        app.vue.get_comments()
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);