define([
    "jquery"
], function($){

    return {
        init: function(){
            return this.applyCouponOnEnter();
        },

        applyCouponOnEnter: function() {
            $(document).on('keypress','input[name="coupon_code"]',function(event){
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){

                    if( $(this).val().length === 0 ) {
                        return;
                    }

                    order.applyCoupon($(this).val());
                }
            });

            return this;
        },
    };

});