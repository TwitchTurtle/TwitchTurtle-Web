function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
var code = getParameterByName('code');

$(document).ready(function() {
if(getCookie("token") == "" || getCookie("token") == null ) {
  if(code) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.twitchturtle.com/code", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        code: code
    }));
    xhr.onload = function() {
      profile = JSON.parse(this.responseText);
      if (this.status == 400) {
          swal("Error!", profile.error, "error").then(function() {
            window.location = "https://www.streamlabs.com/api/v1.0/authorize?client_id=e4lKhBGqlUblZ8JhIdW1jCvRqrQ6k4OjRSUcazTE&redirect_uri=https://twitchturtle.com/dashboard/&response_type=code&scope=donations.create";
          });
      }
      document.cookie = "token="+profile.token;

      submit();
      // document.getElementById("address").innerHTML = profile.address;
    }
  } else {
    window.location.replace("https://www.streamlabs.com/api/v1.0/authorize?client_id=e4lKhBGqlUblZ8JhIdW1jCvRqrQ6k4OjRSUcazTE&redirect_uri=https://twitchturtle.com/dashboard/&response_type=code&scope=donations.create")
  };
} else {
  setInterval(submit(), 10000);
}
});


var profile;
function submit() {
  $.each(transactionsJSON(), function(index, value){
    if (value.transactions !== undefined && value.transactions.length != 0) {
      $.each(value.transactions, function(index2, value2){
        $('#rows').append(
          '<tr>' +
            '<td sorttable_customkey="' + value2.timestamp + '">'+moment.unix((value2.timestamp)).fromNow()+'</td>' +
            '<td>'+convertExtraToName(value2.extra)+'</a></td>' +
            '<td>'+convertExtraToMessage(value2.extra)+'</td>' +
            '<td>'+(value2.amount/100).toFixed(2)+'</td>' +
          '</tr>'
        );
      });
    }
  });
  sorttable.innerSortFunction.apply(document.getElementById('time'), [])
  sorttable.innerSortFunction.apply(document.getElementById('time'), [])
}

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function copyToClipboard(element) {
 var $temp = $("<input>");
 $("body").append($temp);
 $temp.val($(element).html()).select();
 document.execCommand("copy");
 $temp.remove();
}

function convertExtraToName(extra) {
  try {
    var x = JSON.parse(hex2a(extra));
    return x.name
  }
  catch(err) {
    return "Anonymous";
  }
}
function convertExtraToMessage(extra) {
  try {
    var x = JSON.parse(hex2a(extra));
    return x.message
  }
  catch(err) {
    return "None";
  }
}

function transactionsJSON() {
    var resp ;
    var xmlHttp ;

    resp  = '' ;
    xmlHttp = new XMLHttpRequest();

    var token = getCookie("token");
    if (token == "" || token == null) {
        return
    }

    if(xmlHttp != null)
    {
        xmlHttp.open( "GET", "https://api.twitchturtle.com/userStats", false );
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.setRequestHeader("Authorization", "Basic " + btoa(token + ":" + 'nonce'));
        xmlHttp.send( null );
        resp = xmlHttp.responseText;
    }
    if(xmlHttp.status == 401) {
      swal("Error!", 'Incorrect Username/Password', "error").then(() => {
        modal.style.display='block'
      });
    }
    json = JSON.parse(resp);
    document.getElementById("name").innerHTML = json.name;
    document.getElementById("address").innerHTML = json.address;

    document.getElementById("blockCount").innerHTML = json.status.blockCount;
    document.getElementById("knownBlockCount").innerHTML = json.status.knownBlockCount;

    document.getElementById("available_balance").innerHTML = (json.balance.availableBalance/100).toFixed(2);
    document.getElementById("locked_amount").innerHTML = (json.balance.lockedAmount/100).toFixed(2);

    return json.transactions;
    }
