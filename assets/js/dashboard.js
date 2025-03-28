
   $(document).ready(function() {
   $("#loadsidebar").load("includes/sidebar.html");
   function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
    }

    var token = getCookie("authToken");
    //console.log("Generated Token "+token);

});