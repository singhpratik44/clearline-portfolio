import {checkoutConfig} from "./checkout-config.mjs";
const button=document.getElementById("buyCompanion");
const status=document.getElementById("checkoutStatus");
const price=document.getElementById("price");
const expectedHost="buy.stripe.com";
const validUrl=(url)=>{
  try{
    const u=new URL(url);
    return u.protocol==="https:" && u.hostname===expectedHost &&
      /^\/[A-Za-z0-9_-]{8,}$/.test(u.pathname) && !u.username && !u.password && !u.search && !u.hash;
  }catch{return false;}
};
price.textContent="";
price.append(document.createTextNode("$"+checkoutConfig.proposedOneTimeUSD+" "));
const note=document.createElement("span");
note.textContent="one-time"+(checkoutConfig.enabled?"":" · proposed");
price.append(note);
if(checkoutConfig.enabled && validUrl(checkoutConfig.stripePaymentUrl)){
  button.href=checkoutConfig.stripePaymentUrl;
  button.classList.remove("is-disabled");
  button.removeAttribute("aria-disabled");
  button.replaceChildren(document.createTextNode("Purchase companion · Stripe checkout ↗"));
  button.setAttribute("rel","noopener noreferrer");
  status.textContent="Secure card processing is provided by Stripe on its hosted checkout page. Read the product description before paying.";
}else{
  button.setAttribute("aria-disabled","true");
  button.classList.add("is-disabled");
  button.href="#details";
  button.textContent="Checkout is not yet active";
  status.textContent="The optional companion is being prepared for sale. No payments are accepted from this page yet.";
  button.addEventListener("click",event=>event.preventDefault());
}
