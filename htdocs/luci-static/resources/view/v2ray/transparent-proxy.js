"use strict";"require form";"require fs";"require uci";"require ui";"require v2ray";"require view/v2ray/include/custom as custom";"require view/v2ray/tools/base64 as base64";"require view/v2ray/tools/converters as converters";var gfwlistUrls={github:"https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt",gitlab:"https://gitlab.com/gfwlist/gfwlist/raw/master/gfwlist.txt",pagure:"https://pagure.io/gfwlist/raw/master/f/gfwlist.txt",bitbucket:"https://bitbucket.org/gfwlist/gfwlist/raw/HEAD/gfwlist.txt"},apnicDelegatedUrls={apnic:"https://ftp.apnic.net/stats/apnic/delegated-apnic-latest",arin:"https://ftp.arin.net/pub/stats/apnic/delegated-apnic-latest",ripe:"https://ftp.ripe.net/pub/stats/apnic/delegated-apnic-latest",iana:"https://ftp.iana.org/pub/mirror/rirstats/apnic/delegated-apnic-latest"};return L.view.extend({handleListUpdate:function(t,e,r){switch(r){case"gfwlist":var i=uci.get("v2ray",e,"gfwlist_mirror")||"github",a=gfwlistUrls[i];L.Request.get(a).then((function(t){if(200===t.status){var e=t.text();if(e&&(e=e.replace(/\r?\n/g,""))){var r=void 0;try{r=base64.decode(e)}catch(t){console.log(t),r=""}var i=converters.extractGFWList(r);fs.write("/etc/v2ray/gfwlist.txt",i).then((function(){ui.addNotification(null,E("p",_("List updated.")))})).catch(L.raise)}else L.raise("Error",_("Failed to fetch GFWList."))}else ui.addNotification(null,E("p",t.statusText))}));break;case"chnroute":case"chnroute6":var o=uci.get("v2ray",e,"apnic_delegated_mirror")||"apnic";a=apnicDelegatedUrls[o];L.Request.get(a).then((function(t){if(200===t.status){var e;if(e=t.text()){var i=converters.extractCHNRoute(e,"chnroute6"===r);fs.write("/etc/v2ray/"+r+".txt",i).then((function(){ui.addNotification(null,E("p",_("List updated.")))})).catch(L.raise)}else L.raise("Error",_("Failed to fetch CHNRoute list."))}else ui.addNotification(null,E("p",t.statusText))}));break;default:L.raise("Error",_("Unexpected error."))}},load:function(){return Promise.all([v2ray.getLanInterfaces(),v2ray.getDokodemoDoorPorts()])},render:function(t){var e,r=void 0===t?[]:t,i=r[0],a=void 0===i?[]:i,o=r[1],s=void 0===o?[]:o,l=new form.Map("v2ray","%s - %s".format(_("V2Ray"),_("Transparent Proxy"))),n=l.section(form.NamedSection,"main_transparent_proxy","transparent_proxy");e=n.option(form.Value,"redirect_port",_("Redirect port"),_("Enable transparent proxy on Dokodemo-door port."));for(var p=0,c=s;p<c.length;p++){var d=c[p];e.value(d.value,d.caption)}e.value("",_("None")),e.datatype="port",e=n.option(form.MultiValue,"lan_ifaces",_("LAN interfaces"),_("Enable proxy on selected interfaces."));for(var u=0,f=a;u<f.length;u++){var g=f[u];e.value(g.value,g.caption)}return e=n.option(form.Flag,"use_tproxy",_("Use TProxy"),_("Setup redirect rules with TProxy.")),e=n.option(form.Flag,"only_privileged_ports",_("Only privileged ports"),_("Only redirect traffic on ports below 1024.")),e=n.option(form.Flag,"redirect_udp",_("Redirect UDP"),_("Redirect UDP traffic to V2Ray.")),(e=n.option(form.Flag,"redirect_dns",_("Redirect DNS"),_("Redirect DNS traffic to V2Ray."))).depends("redirect_udp",""),e.depends("redirect_udp","0"),(e=n.option(form.ListValue,"proxy_mode",_("Proxy mode"),_("If enabled, iptables rules will be added to pre-filter traffic and then sent to V2Ray."))).value("default",_("Default")),e.value("cn_direct",_("CN Direct")),e.value("cn_proxy",_("CN Proxy")),e.value("gfwlist_proxy",_("GFWList Proxy")),(e=n.option(form.ListValue,"apnic_delegated_mirror",_("APNIC delegated mirror"))).value("apnic","APNIC"),e.value("arin","ARIN"),e.value("ripe","RIPE"),e.value("iana","IANA"),(e=n.option(custom.ListStatusValue,"_chnroutelist",_("CHNRoute"))).listtype="chnroute",e.btntitle=_("Update"),e.onupdate=L.bind(this.handleListUpdate,this),(e=n.option(form.ListValue,"gfwlist_mirror",_("GFWList mirror"))).value("github","GitHub"),e.value("gitlab","GitLab"),e.value("bitbucket","Bitbucket"),e.value("pagure","Pagure"),(e=n.option(custom.ListStatusValue,"_gfwlist",_("GFWList"))).listtype="gfwlist",e.btntitle=_("Update"),e.onupdate=L.bind(this.handleListUpdate,this),(e=n.option(custom.TextValue,"_proxy_list",_("Extra proxy list"),_("One address per line. Allow types: DOMAIN, IP, CIDR. eg: %s, %s, %s").format("www.google.com","1.1.1.1","192.168.0.0/16"))).wrap="off",e.rows=5,e.datatype="string",e.filepath="/etc/v2ray/proxylist.txt",(e=n.option(custom.TextValue,"_direct_list",_("Extra direct list"),_("One address per line. Allow types: DOMAIN, IP, CIDR. eg: %s, %s, %s").format("www.google.com","1.1.1.1","192.168.0.0/16"))).wrap="off",e.rows=5,e.datatype="string",e.filepath="/etc/v2ray/directlist.txt",e=n.option(form.Value,"proxy_list_dns",_("Proxy list DNS"),_("DNS used for domains in proxy list, format: <code>ip#port</code>. eg: %s").format("1.1.1.1#53")),e=n.option(form.Value,"direct_list_dns",_("Direct list DNS"),_("DNS used for domains in direct list, format: <code>ip#port</code>. eg: %s").format("114.114.114.114#53")),(e=n.option(custom.TextValue,"_src_direct_list",_("Local devices direct outbound list"),_("One address per line. Allow types: IP, CIDR. eg: %s, %s").format("192.168.0.19","192.168.0.0/16"))).wrap="off",e.rows=3,e.datatype="string",e.filepath="/etc/v2ray/srcdirectlist.txt",l.render()}});