
        function validatePassword() {
            console.log('password validate')
            let form_inputs = document.querySelectorAll('.form-input')
            let error_shown = document.querySelector('.error_shown')
            const loginForm = document.getElementById('login-form');
            if (form_inputs[2].value != form_inputs[3].value) {
                error_shown.innerHTML = "confirm password doesn't match"
                return setTimeout(() => {
                    error_shown.innerHTML = ""
                }, 5000)
 
            }
            else{
                loginForm.submit()
            }
          
          

        }