/* =========================================
   Show/hide password toggle
   ========================================= */
document.querySelectorAll('[data-toggle-password]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const input=document.getElementById(btn.dataset.togglePassword);
    const show=input.type==='password';
    input.type=show?'text':'password';
    btn.setAttribute('aria-label',show?'Hide password':'Show password');
  });
});
/* =========================================
   Basic client-side validation
   ========================================= */
const form=document.querySelector('form');
const setError=(input,msg)=>{
  const err=input.closest('.field').querySelector('.error');
  input.setAttribute('aria-invalid',msg?'true':'false');
  if(err) err.textContent=msg||'';
  return !msg;
};
form.addEventListener('submit',e=>{
  e.preventDefault();
  let ok=true;
  form.querySelectorAll('input[type=email]').forEach(i=>{
    ok=setError(i,/^\S+@\S+\.\S+$/.test(i.value)?'':'Enter a valid email address.')&&ok;
  });
  const pw=form.querySelector('#password');
  if(pw){
    const min=form.dataset.minPassword||1;
    ok=setError(pw,pw.value.length>=min?'':(min>1?`Use at least ${min} characters.`:'Enter your password.'))&&ok;
  }
  const confirm=form.querySelector('#confirm');
  if(confirm) ok=setError(confirm,confirm.value===pw.value?'':'Passwords do not match.')&&ok;
  if(!ok) return;

 /* =========================================
   7. FORM SUBMISSION
   ========================================= */
  // TODO: send form data to backend here
  const notice=document.querySelector('.notice');
  if(notice) notice.classList.add('show');
});
