// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()


let taxSwitch = document.querySelector("#taxSwitch");

if (taxSwitch) {
    taxSwitch.addEventListener("change", () => {

        let prices = document.querySelectorAll(".listing-price");

        prices.forEach((price) => {
            let originalPrice = Number(price.dataset.price);

            if (taxSwitch.checked) {
                let totalPrice = originalPrice * 1.10;

                price.innerHTML =
                    `₹${totalPrice.toLocaleString("en-IN", {
                        maximumFractionDigits: 2
                    })} <span>including taxes</span>`;

            } else {
                price.innerHTML =
                    `₹${originalPrice.toLocaleString("en-IN")} 
                    <span>+ 10% taxes</span>`;
            }
        });

    });
}

let themeToggle = document.querySelector("#themeToggle");

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
});