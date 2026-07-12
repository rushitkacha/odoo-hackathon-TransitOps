const Router = (() => {
  const routes = {}; let currentRoute=null; let contentContainer=null;
  function register(hash,config){routes[hash]=config;}
  function init(containerSelector,defaultRoute='dashboard'){contentContainer=document.querySelector(containerSelector);window.addEventListener('hashchange',()=>navigate(getHash()));const initial=getHash()||defaultRoute;if(!window.location.hash)window.location.hash=`#${initial}`;else navigate(initial);}
  function navigate(hash){const route=routes[hash]||routes.dashboard;if(!route)return;document.querySelectorAll('.sidebar-nav-item').forEach(item=>item.classList.toggle('active',item.dataset.page===hash));document.title=`${route.title} – ${AppConfig.APP_NAME}`;const breadcrumb=document.querySelector('.header-breadcrumb-current');if(breadcrumb)breadcrumb.textContent=route.title;if(contentContainer)contentContainer.innerHTML=typeof route.template==='function'?route.template():route.template;if(route.init)route.init();currentRoute=hash;window.scrollTo({top:0,behavior:'instant'});}
  function getHash(){return window.location.hash.replace('#','').split('?')[0];}
  function getCurrent(){return currentRoute;}
  return{register,init,navigate,getCurrent};
})();
