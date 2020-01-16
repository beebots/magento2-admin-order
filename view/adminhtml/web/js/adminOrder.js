define([
    "jquery"
], function($){
    //apply coupon on enter
    $(document).on('keypress','input[name="coupon_code"]',function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){

            if( $(this).val().length === 0 ) {
                return;
            }

            order.applyCoupon($(this).val());
        }
    });

});