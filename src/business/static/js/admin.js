/*
author:yfgeek,rujia
website:www.yfgeek.com
version:1.0
*/

/*****************************public*********************************/
//显示正确或者，错误符号
function prefix(i){
    if(i=="0"){
        return "<i class='fa fa-close' aria-hidden='true'></i>";
    }else{
        return "<i class='fa fa-check' aria-hidden='true'></i>";
    }
}

//获取格式化时间
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
}

//获取随机数字
function getRandomNum(){  
    var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];  
    var nums="";  
    for(var i=0;i<32;i++){  
        var id = parseInt(Math.random()*61);  
        nums+=chars[id];  
    }  
    return nums;  
}

//字符串转16进制
function strToHexCharCode(str) {
    if(str === "")
     return "";
    var hexCharCode = [];
    //hexCharCode.push("0x");    
    for(var i = 0; i < str.length; i++) {
     hexCharCode.push((str.charCodeAt(i)).toString(16));
    }
    return hexCharCode.join("");
}

/*****************************broadcastedTransaction.html***********************************/

function broadcastedRawTranList(){
    $.getJSON("recordslist", function(result) {
        $(".sbcon").html("");
        $.each(result, function(i, item) {
            var  viewstr = "<td><button type='button' class='btn btn-info verifying' data-toggle='modal' data-target='#myModal1' onclick='viewBroadcastedTran(\""+item['r_id']+"\")'>View</button></td> ";
            $(".sbcon").append("<tr><td>" + (item['merkleRootHex']+"").substring(0,10) + "...</td><td class = 'id"+item['r_id']+"'data-raw="+item['rawtran'] + ">" + item['rawtran'].substring(0,50) + "...</td><td>" + prefix(item['user1']) + "</td><td>"+ prefix(item['user2']) +"</td><td>" + prefix(item['user3']) + "</td><td>" + item['state'] +" / 3</td><td>" +prefix(item['is_send']) + "</td>"+viewstr+"</tr>");
        });
        $(".loadingsb").hide();
    });
}

function viewBroadcastedTran(r_id){
	//alert(r_id);
	var postdata = {'r_id':r_id}
	$.post("getRecordsAndCerts", postdata,function(result) {
		    
		    var vdata = $.parseJSON(result); 
		    $("#mkr").val(vdata["merkleRootHex"])
		    $("#rawTran").val(vdata["rawtran"])
		    var certificates = vdata["certificates"]
		    
		    var thtml = "<tr style='font-weight:bold;'><td class='col-xs-1'>Name</td><td class='col-xs-2'>Degree</td></tr>"
		    $.each(certificates, function(idx, obj) {
		    	var sname =  obj["recipient"]
		        var cname = obj["certificate"]["name"]
		    	thtml = thtml + "<tr><td class='col-xs-1'>"+sname+"</td><td class='col-xs-2'><input class='form-control' type='text' value='"+cname+"' readonly=''></td></tr>"
		    });
		    
		    $("#certsid").html(thtml)
		    //$(".loadingsb").hide();
	        //if(result==1){
	        //	$('#sginModal').modal('hide');
	        //	unBroadcastRawTranList();
	        //}
	 });
}


/*****************************unBroadcastTransaction.html*********************************/

function unBroadcastRawTranList(){
    $.getJSON("unRecordslist", function(result) {
        $(".sbcon").html("");
        $.each(result, function(i, item) {
                var  verifystr = "<td><button type='button' class='btn btn-info verifying' data-toggle='modal' data-target='#myModal' onclick='getRaw(\""+item['r_id']+"\")'>Verify</button>  ";
                var  signstr = "<button type='button' class='btn btn-info sign' data-toggle='modal' data-target='#sginModal' onclick='getSign(\""+item['r_id']+"\")'>Sign</button>  ";
                var  broadcaststr = "<button type='button' class='btn btn-info broadcast' data-id='{$zaocommit.id}' data-toggle='modal' data-target='#broadcastModal' onclick='getBroadcast(\""+item['r_id']+"\")'>Bcast</button>  ";
                var  deletestr = "<button type='button' class='btn btn-danger' onclick='deleteTran(\""+item['r_id']+"\")'>Del</button>  </td>";
                var actionstr = verifystr + signstr + broadcaststr + deletestr;
                $(".sbcon").append("<tr><td>" + (item['merkleRootHex']+"").substring(0,10) + "...</td><td class = 'id"+item['r_id']+"'data-raw="+item['rawtran'] + ">" + item['rawtran'].substring(0,50) + "...</td><td>" + prefix(item['user1']) + "</td><td>"+ prefix(item['user2']) +"</td><td>" + prefix(item['user3']) + "</td><td>" + item['state'] +" / 3</td><td>" +prefix(item['is_send']) + "</td>"+actionstr+"</tr>");
        });
    $(".loadingsb").hide();
    });
}


//获取单个，并展现
function getRaw(className){
	raw=$(".id"+className).attr("data-raw");
    var tx = coinjs.transaction();
try {
    var decode = tx.deserialize(raw);
//	console.log(decode);
    $("#verifyTransactionData .transactionVersion").html(decode['version']);
    $("#verifyTransactionData .transactionSize").html(decode.size()+' <i>bytes</i>');
    $("#verifyTransactionData .transactionLockTime").html(decode['lock_time']);
    $("#verifyTransactionData .transactionRBF").hide();
    $("#verifyTransactionData").removeClass("hidden");
    $("#verifyTransactionData tbody").html("");
    var s ='';

    s = '<table class="table table-hover"><thead><tr style="font-weight:bold;"><th>Version</th><th>Transaction Size</th><th>Lock time</th></tr></thead><tbody><tr><td><span class="transactionVersion">'+decode['version']+'</span></td><td><span class="transactionSize"> <i>'+decode.size()+'bytes</i></span></td><td><span class="transactionLockTime">'+decode['lock_time']+'</span></td></tr></tbody></table>';
    $(s).appendTo("#verifyTransactionData .info");


    var h = '';
    $.each(decode.ins, function(i,o){
        var s = decode.extractScriptKey(i);
        h += '<tr>';
        h += '<td><input class="form-control" type="text" value="'+o.outpoint.hash+'" readonly></td>';
        h += '<td class="col-xs-1">'+o.outpoint.index+'</td>';
        h += '<td class="col-xs-2"><input class="form-control" type="text" value="'+Crypto.util.bytesToHex(o.script.buffer)+'" readonly></td>';
        h += '<td class="col-xs-1"> <i class="fa fa-'+((s.signed=='true')?'check':'close')+'"></i>';
        if(s['type']=='multisig' && s['signatures']>=1){
            h += ' '+s['signatures'];
        }
        h += '</td>';
        h += '<td class="col-xs-1">';
        if(s['type']=='multisig'){
            var script = coinjs.script();
            var rs = script.decodeRedeemScript(s.script);
            h += rs['signaturesRequired']+' of '+rs['pubkeys'].length;
        } else {
            h += '<i class="fa fa-close"></i>';
        }
        h += '</td>';
        h += '</tr>';

        //debug
        if(parseInt(o.sequence)<(0xFFFFFFFF-1)){
            $("#verifyTransactionData .transactionRBF").show();
        }
    });
    $(h).appendTo("#verifyTransactionData .ins tbody");

    h = '';
    $.each(decode.outs, function(i,o){

        if(o.script.chunks.length==2 && o.script.chunks[0]==106){ // OP_RETURN

            var data = Crypto.util.bytesToHex(o.script.chunks[1]);
            var dataascii = hex2ascii(data);

            if(dataascii.match(/^[\s\d\w]+$/ig)){
                data = dataascii;
            }

            h += '<tr>';
            h += '<td><input type="text" class="form-control" value="(OP_RETURN) '+data+'" readonly></td>';
            h += '<td class="col-xs-1">'+(o.value/100000000).toFixed(8)+'</td>';
            h += '<td class="col-xs-2"><input class="form-control" type="text" value="'+Crypto.util.bytesToHex(o.script.buffer)+'" readonly></td>';
            h += '</tr>';
        } else {
            var addr = '';
            if(o.script.chunks.length==5){
                addr = coinjs.scripthash2address(Crypto.util.bytesToHex(o.script.chunks[2]));
            } else {
                var pub = coinjs.pub;
                coinjs.pub = coinjs.multisig;
                addr = coinjs.scripthash2address(Crypto.util.bytesToHex(o.script.chunks[1]));
                coinjs.pub = pub;
            }

            h += '<tr>';
            h += '<td><input class="form-control" type="text" value="'+addr+'" readonly></td>';
            h += '<td class="col-xs-1">'+(o.value/100000000).toFixed(8)+'</td>';
            h += '<td class="col-xs-2"><input class="form-control" type="text" value="'+Crypto.util.bytesToHex(o.script.buffer)+'" readonly></td>';
            h += '</tr>';
        }
    });
    $(h).appendTo("#verifyTransactionData .outs tbody");
    $(".verifyLink").attr('href','?verify='+$("#verifyScript").val());
    return true;
} catch(e) {
    return false;
}
}
function hex2ascii(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function getSign(className) {
	var script = $(".id"+className);
	
    $("#signTransaction").val(script.attr("data-raw"));
    var wifkey = $("#signPrivateKey");
    $("#tmprid").val(className);
    if(coinjs.addressDecode(wifkey.val())){
        $(wifkey).parent().removeClass('has-error');
    } else {
        $(wifkey).parent().addClass('has-error');
    }

    try {
        var tx = coinjs.transaction();
        var t = tx.deserialize(script.attr("data-raw"));
        var signed = t.sign(wifkey.val(), 1);
        $("#signedData textarea").val(signed);
        $("#signedData .txSize").html(t.size());
        $("#signedData").removeClass('hidden').fadeIn();
    } catch(e) {
        // console.log(e);
    }
};


//广播
$("#rawSubmitBtn").click(function(){
	
    $(this).val('Please wait, loading...').attr('disabled',true);
    $("#rawTransactionStatus").addClass('alert-success').removeClass("hidden");
	$("#rawTransactionStatus").html("1.Broadcasting the rawTransaction to the peer to peer network [READY]. </br>");
	
	var r_id = $("#r_idb").val()
	
    $.ajax ({
        type: "POST",
        url: coinjs.host+'?uid='+coinjs.uid+'&key='+coinjs.key+'&setmodule=bitcoin&request=sendrawtransaction',
        data: {'rawtx':$("#rawTransaction").val()},
        dataType: "xml",
        error: function(data) {
            $("#rawTransactionStatus").addClass('alert-danger').removeClass('alert-success').removeClass("hidden").html(" There was an error submitting your request, please try again").prepend('<span class="glyphicon glyphicon-exclamation-sign"></span>');
        },
        success: function(data) {
            //$("#rawTransactionStatus").html(unescape($(data).find("response").text()).replace(/\+/g,' ')).removeClass('hidden');
            if($(data).find("result").text()==1){
            	txid = $(data).find("txid").text();
            	$("#rawTransactionStatus").html("1.Broadcasting the rawTransaction to the peer to peer network.[NONE]. </br>");
            	$("#rawTransactionStatus").append("2.RawTransaction have been broadcasted, <a href = 'https://blockchain.info/tx/"+txid+"'>check here</a> </br>");
                //$("#rawTransactionStatus").addClass('alert-success').removeClass('alert-danger');
                //$("#rawTransactionStatus").html('txid: '+$(data).find("txid").text());
            	var postdata = {'txid':txid,'r_id':r_id}
            	$("#rawTransactionStatus").append("3.Generating new Certificate with receipt.[NONE] </br>");
            	$.post("generatedCertificate", postdata,function(result) {
            	    $(".loadingsb").hide();
                    if(result==1){
                    	$("#rawTransactionStatus").append("4.Update the rawTransaction records. </br>");
                    	//$('#sginModal').modal('hide');
                    	unBroadcastRawTranList();
                    	$("#rawTransactionStatus").append("5.congratulations, all the progress have been done successfully. </br>");
                    	$("#rawSubmitBtn").val('OK').attr('disabled',true);
                    }
            	});
            } else {
                $("#rawTransactionStatus").addClass('alert-danger').removeClass('alert-success').prepend('<span class="glyphicon glyphicon-exclamation-sign"></span> ');
            }
        },
        complete: function(data, status) {
            //$("#rawTransactionStatus").fadeOut().fadeIn();
            //$(thisbtn).val('Submit').attr('disabled',false);
        }
    })
    
	/*var txid = 'd8c163235e616e9af780e1205e87f62df473d08a20b24f13439f7154c0d5aff5';
	
	var postdata = {'txid':txid,'r_id':r_id}
	$("#rawTransactionStatus").append("3.Generating new Certificate with receipt. </br>");
	$.post("generatedCertificate", postdata,function(result) {
	    $(".loadingsb").hide();
        if(result==1){
        	$("#rawTransactionStatus").append("4.Update the rawTransaction records. </br>");
        	//$('#sginModal').modal('hide');
        	unBroadcastRawTranList();
        	$("#rawTransactionStatus").append("5.congratulations, all the progress have been done successfully. </br>");
        	$("#rawSubmitBtn").val('OK').attr('disabled',true);
        }
	});*/
	
});


$("#sendBtn").click(function(){
	rawtran = $('#signTranData').val();
	r_id = $('#tmprid').val();
	
	var postdata = {'rawtran':rawtran,'r_id':r_id}
	$.post("recordsupdate", postdata,function(result) {
		    $(".loadingsb").hide();
	        if(result==1){
	        	$('#sginModal').modal('hide');
	        	unBroadcastRawTranList();
	        }
	 });
})

function getBroadcast(className){
	var raw=$(".id"+className).attr("data-raw");
	$("#rawTransaction").val(raw);
	$("#r_idb").val(className)
}

//删除
function deleteTran(r_id){
	var msg = "are you sure you want to delete this item?";
	if (confirm(msg)==true){
		var postData = {"r_id":r_id};
		$.post("/recordsDelete",postData,function(result) {
			if(result==1){
				unBroadcastRawTranList();
			}
		})
	}else{
		return false;
	}
}

/*****************************broadcastTransaction.html*********************************/




/*****************************unIssuedCertificates.html*********************************/

function loadunIssuecertificate(){
    $.getJSON("unIssueCertifacteList", function(result) {
        $(".sbcon").html("");
        $.each(result, function(i, item) {
            	var viewstr = "<td><button type='button' class='btn btn-info view' data-toggle='modal' data-target='#myModal1' onclick='viewUnissueCerts(\""+item['r_id']+"\")'>View</button> ";
                var issuestr = "<button type='button' class='btn btn-info view' data-toggle='modal' data-target='#myModal2' >Merge</button>  ";
                var deletestr = "<button type='button' class='btn btn-danger' onclick='deleteCerts(\""+item['r_id']+"\")'>Delete</button>  </td> ";
                $(".sbcon").append("<tr><td class = 'id"+item['r_id']+"' data-raw='"+JSON.stringify(item['certificate']) + "'>" + item['issuer']+ "</td><td>" + item['recipient'] + "</td><td>"+ item['issuedOn'] +"</td>" + viewstr+issuestr+deletestr+  "</tr>");
        });
        $(".loadingsb").hide();
        
        //全局参数，用来传参
        publicIssuList = ""
        //加载复选框
        var ihtml = "";
        $.each(result, function(i, item) {
        	ihtml = ihtml + "<li><input type='checkbox' name='checkbox' data-labelauty='"+item['recipient']+"' onclick = 'putIntoList(\""+item['r_id']+"\");'></li>  &nbsp; &nbsp; "
        })
        $("#issuname").html(ihtml);
        $(':input').labelauty();
    });
}

//查看未发布的详情
function viewUnissueCerts(className){
	viewdata=$(".id"+className).attr("data-raw");
	var thtml = '<textarea class="form-control" rows="30">'+viewdata+'</textarea>'
	var vdata = $.parseJSON(viewdata); 
	$("#vdata").JSONView(vdata);	
	$("#json-collasped").JSONView(vdata, { collapsed: true });
	//$("#vdata").html(thtml)
	
	/*$('#collapse-btn').on('click', function() {
        $('#vdata').JSONView('collapse');
    });

    $('#expand-btn').on('click', function() {
        $('#vdata').JSONView('expand');
    });*/
}

//删除证书
function deleteCerts(r_id){
	var msg = "are you sure you want to delete this item?";
	if (confirm(msg)==true){
		var postData = {"r_id":r_id};
		$.post("/unIssueCertifacteDelete",postData,function(result) {
			if(result==1){
				loadunIssuecertificate();
			}
		})
	}else{
		return false;
	}
}

//处理选中结果
function putIntoList(r_id){
	publicIssuList = publicIssuList +","+r_id;
}

//将结果合并到一个交易中去
function mergeCertificate(){
	 publicIssuList = publicIssuList.substring(1,publicIssuList.length)
	 
	 $("#mergeStatus").append("1. Get the selected certificates Id. </br>");
	 
	 var nLockTime = 0
	 rd = "5221038b1df5a4e05a0ee0a36b5d3a1e44c22ebdb2a0ce57df45650b06b167a85d48d4210379ed77927da05af3b854248c0a6b15e10b41437307c1f6e099f755fc0b973ae321031cf51d3076172465633b6faca2499da938b1c99832922533bcbfc1cf9c40884153ae";
	 var redeem = redeemingFrom(rd);
	 var tx = coinjs.transaction();
	 n = 0;
	 tx.listUnspent(redeem.addr, function(data){
	 if(redeem.addr) {
		$.each($(data).find("unspent").children(), function(i,o){
			tx_hash = $(o).find("tx_hash").text();
			n = $(o).find("tx_output_n").text();
			script = rd;
			amount = (($(o).find("value").text()*1)/100000000).toFixed(8);
			makeRawTrasaction(tx_hash,n,script,publicIssuList);
		});
	  }
		//totalInputAmount();
		//mediatorPayment(redeem);
	 });
}

//制作原始交易
function makeRawTrasaction(tx_hash,n,script,publicIssuList){
	$("#mergeStatus").append("2. Redeem the coins form the previous transaction. </br>");
	 var seq = null;
	 var tx = coinjs.transaction();
	 var estimatedTxSize = 10;
	 tx.lock_time = 0;
	 
	 var currentScript = script;
	 
	 // input
	 var scriptSigSize = (parseInt(currentScript.slice(1,2),16) * 74) + (parseInt(currentScript.slice(-3,-2),16) * 34) + 43
		// varint 2 bytes if scriptSig is > 252
	 estimatedTxSize += scriptSigSize + (scriptSigSize > 252 ? 2 : 1)
	 
	 var txid = ((tx_hash).match(/.{1,2}/g).reverse()).join("")+'';
	 tx.addinput(txid, n, script, seq);   
	 
	// output
	 var a = "16PiKYuxSywBzeJYAYHDByiXQUrYQjwxN5"
	 var ad = coinjs.addressDecode(a);
	 estimatedTxSize += (ad.version == coinjs.pub ? 34 : 32)
	 tx.addoutput(a, "0.0100");
	 
	 //alert(publicIssuList)
	 
	 $("#mergeStatus").append("3. Prepare datas for a new raw transaction. </br>");
	 
	 var postData = {"r_ids":publicIssuList};
	 $.post("/mergeCertificate",postData, function(merkleRoot) {
	   if(merkleRoot!=0){
		   //var dataAddress = "821fb3836908f90db2bf640e15622cd8ddc7bfcc8f6fba98855421ae747f8ff5";
		   var dahex = strToHexCharCode(merkleRoot);
		   
		   $("#mergeStatus").append("4. Get the merkle tree root from selected certificates. </br>");
		   //$("#mergeStatus").append("merkle tree root : "+dahex+". </br>");
		   
		   estimatedTxSize += (dahex.length / 2) + 1 + 8
		   tx.adddata(dahex);
		   //tx.addinput(tx, n, rd, seq);
		   rawTransaction = tx.serialize();
		   $("#mergeStatus").append("5. Merge the merkle tree root into the new transaction. </br>");
		   //alert(rawTransaction);
		   //console.log(rawTransaction)
		   insertRecords(rawTransaction,dahex,publicIssuList)
	   }
    });
}


//插入新的交易
function insertRecords(rawtran,merkleRootHex,certids){
	 var r_id = getRandomNum();
	 var postData = {"r_id":r_id,"rawtran":rawtran,"merkleRootHex":merkleRootHex,"certids":certids};
	 
	 $("#mergeStatus").append("6. Insert the new transaction to database. </br>");
	 $.post("/insertRecords",postData, function(result) {
	   if(result==1){
		  alert("ok")
	   }
     });
	 $("#mergeStatus").append("7. Congratulations, all the progress have been done successfully. </br>");
}

/*****************************IssuedCertificates.html*********************************/
function loadIssuecertificate(){
    $.getJSON("issueCertifacteList", function(result) {
        $(".sbcon").html("");
        $.each(result, function(i, item) {
                //var actionstr = "<td><button type='button' class='btn btn-info view' data-toggle='modal' data-target='#myModal2' onclick='startIssueCerts(\""+item['r_id']+"\")'>Issue</button>";
                var viewstr = "<td><button type='button' class='btn btn-info view' data-toggle='modal' data-target='#myModal1' onclick='viewIssueCerts(\""+item['r_id']+"\")'>View</button></td>";
                $(".sbcon").append("<tr><td class = 'id"+item['r_id']+"' data-raw='"+JSON.stringify(item['certificate']) + "'>" + item['issuer']+ "</td><td>" + item['recipient'] + "</td><td>"+ item['issuedOn'] +"</td>" + viewstr+"</tr>");
        });
        $(".loadingsb").hide();
    });
}

var resultData;
function viewIssueCerts(r_id){
	//alert(r_id)
	var postData = {"r_id":r_id}
	$.post("/getIssuedCertificate",postData, function(result) {
		resultData = result;
		var vdata = $.parseJSON(result); 
		var certStr = vdata[0]["certificate"]
		var receiptStr = vdata[0]["receipt"]
		
		var doc = {
				"certificate":certStr,
				"receipt":receiptStr
		}
		
		$("#vdata").JSONView(doc, {collapsed:true,nl2br:true});	
		//$("#json-collasped").JSONView(result, {collapsed:false});
		//$('#vdata').JSONView('expand',3);
	});
	
	$('#collapse-btn').on('click', function() {
        $('#vdata').JSONView('collapse');
    });

    $('#expand-btn').on('click', function() {
        $('#vdata').JSONView('expand');
    });
    
    $('#qrcode-btn').on('click', function() {
    	$("#qrcode").html("");
		var qrstr = false;
		var vdata = $.parseJSON(resultData); 
		var certStr = vdata[0]["certificate"]
		/*var receiptStr = vdata[0]["receipt"]
		
		var doc = {
				"certificate":certStr,
				"receipt":receiptStr
		}*/
		
		var qrstr = JSON.stringify(certStr)
		var w = (screen.availWidth > screen.availHeight ? screen.availWidth : screen.availHeight)/3;
		var qrcode = new QRCode("qrcode", {width:w, height:w});
		//qrstr = $(ta).val();
		if(qrstr.length > 1024){
			$("#qrcode").html("<p>Sorry the data is too long for the QR generator.</p>");
		}
		
		qrcode.makeCode(qrstr);
    });
}

//验证证书，是否正确
function verifyCerts(){
	var vdata = $.parseJSON(resultData); 
	var certStr = vdata[0]["certificate"]
	var receiptStr = vdata[0]["receipt"]
	var txid = receiptStr["anchors"][0]["sourceId"]
	var merkleRoot = receiptStr["merkleRoot"]
	var r_id = vdata[0]["r_id"]
	
	$("#verifyStatus").html("<p>Step 1 of 6</br> Getting the local certificate [NONE] </br></br></p>")
	checkMerkleRootFromBlockchain(r_id,txid,merkleRoot)
	//checkCertificateHashInMerkleTree(r_id)
}

//检查证书merkleroot是否在区块链中
function checkMerkleRootFromBlockchain(r_id,txid,merkleRoot){
	merkleRoot = strToHexCharCode(merkleRoot)
	var postData = {"txid":txid,"merkleRoot":merkleRoot};
	$("#verifyStatus").append("<p>Step 2 of 6</br> Computing SHA256 digest of local certificate [NONE] </br></br></p>")
	$.post("/checkMerkleRootFromBlockchain",postData,function(result) {
		if(result==1){
			$("#verifyStatus").append("<p>Step 3 of 6</br> Checking the hash value in the local merkle root  [PASS] </br></br></p>")
			checkCertificateHashInMerkleTree(r_id)
		}
	})
}

//检查当前的hash是是否在MerkleTree中
function checkCertificateHashInMerkleTree(r_id){
	var postData = {"r_id":r_id};
	$("#verifyStatus").append("<p>Step 4 of 6</br> Fetching merkle root from the blockchain [NONE] </br></br></p>")
	$.post("/checkCertificateHashInMerkleTree",postData,function(result) {
		if(result==1){
			$("#verifyStatus").append("<p>Step 5 of 6</br> Comparing the blockchain merkle root with local merkle root  [PASS] </br></br></p>")
		}
		$("#verifyStatus").append("<p>Step 6 of 6</br> Checking the signature  [NONE] </br></br></p>")
	})
}

/*****************************student-home.html*********************************/

function loadApplyCertificateList(){
	$.getJSON("/applyCertificateList", function(result) {
	    $(".sbcon").html("");
        $.each(result, function(i, item) {
                var deletestr = "<td><button type='button' class='btn btn-info view'  onclick='deleteStuCerts(\""+item['r_id']+"\")'>Delete</button></td> ";
                var viewstr = "<td><button type='button' class='btn btn-info view' data-toggle='modal' data-target='#myModal1' onclick='viewStuCerts(\""+item['r_id']+"\")'>View</button></td>";  
                $(".sbcon").append("<tr><td class = 'id"+item['r_id']+"' data-raw='"+JSON.stringify(item) + "'>" + item['givenName']+ "</td><td>" + item['familyName'] + "</td><td>"+ item['identity'] +"</td><td>"+ item['identityType'] +"</td><td>"+ prefix(item['approved']) +"</td>" + viewstr+deletestr+"</tr>");
        });
        $(".loadingsb").hide();
    });
}

function deleteStuCerts(r_id){
	var msg = "are you sure you want to delete this item?";
	if (confirm(msg)==true){
		var postData = {"r_id":r_id};
		$.post("/applyCertificateDelete",postData,function(result) {
			if(result==1){
				loadApplyCertificateList();
			}
		})
	}else{
		return false;
	}
}

function applyCertificate(){
	var givenName=$("#givenName").val()
	var familyName=$("#familyName").val()
	var identity=$("#identity").val()
	var identityType=$("#identityType").val()
	var postData = {"givenName":givenName,"familyName":familyName,"identity":identity,"identityType":identityType};
	$.post("/applyCertificate",postData, function(result) {
	   if(result==1){
		   loadApplyCertificateList();
		   $('#myModal').modal('hide');
	   }
    });
}

function viewStuCerts(className){
	viewdata=$(".id"+className).attr("data-raw");
	$("#viewdata").JSONView(viewdata);	
	$("#json-collasped").JSONView(viewdata, { collapsed: true });
}


/*****************************approver-home.html*********************************/

function getSchoolSetting(){
	$.getJSON("/getSchoolSetting", function(result) {
		$("#signer_pub_key").val(result[0]['signer_pub_key'])
		$("#email").val(result[0]['email'])
		$("#id").val(result[0]['id'])
		$("#type").val(result[0]['type'])
		$("#url").val(result[0]['url'])
		$("#name").val(result[0]['name'])
    });
}

function loadAllApplyCertificateList(){
	$.getJSON("/loadAllApplyCertificateList?t=1", function(result) {
	    $(".sbcon").html("");
        $.each(result, function(i, item) {
            	var viewstr = "<td><button type='button' class='btn btn-info view' data-toggle='modal' data-target='#myModal1' onclick='viewStuCerts(\""+item['r_id']+"\")'>View</button></td>";  
            	var auditstr = "<td><button type='button' class='btn btn-info view' data-toggle='modal' data-target='#myModal2' onclick='auditStuCerts(\""+item['r_id']+"\")'>Audit</button></td>";  
                var deletestr = "<td><button type='button' class='btn btn-danger' data-toggle='modal'  onclick='deleteStuCerts(\""+item['r_id']+"\")'>Delete</button></td> ";
                $(".sbcon").append("<tr><td class = 'id"+item['r_id']+"' data-raw='"+JSON.stringify(item) + "'>" + item['givenName']+ "</td><td>" + item['familyName'] + "</td><td>"+ item['identity'] +"</td><td>"+ item['identityType'] +"</td><td>"+ prefix(item['approved']) +"</td>" + viewstr+auditstr+deletestr+"</tr>");
        });
        $(".loadingsb").hide();
    });
}


function auditStuCerts(id){
	$("#hid").val(id)
}

function previewCertificate(){
	id = $("#hid").val();
	viewdata=$(".id"+id).attr("data-raw");
	
	//basic info
	language = $("#language").val();
	description = $("#description").val();
	ctype = $("#ctype").val();
	cname = $("#cname").val();
	issuedOn = getNowFormatDate();
	
	// school info
	signer_pub_key = $("#signer_pub_key").val()
	email = $("#email").val()
	id = $("#id").val()
	type = $("#type").val()
	url = $("#url").val()
	name = $("#name").val()
	var issuer = {"name":name,"email":email,"url":url,"type":type,"url":url,"signer_pub_key":signer_pub_key,"id":id}
	
	
	// student info
	var vdata = $.parseJSON(viewdata);	
	var givenName= vdata["givenName"]
	var familyName=vdata["familyName"]
	var identity=vdata["identity"]
	var identityType=vdata["identityType"]
	var recipient = {"givenName":givenName,"familyName":familyName,"identity":identity,"identityType":identityType}
	
	//assertion
	var assertion = {
		"issuedOn":issuedOn,	
		"type": "Assertion",
		"uid": getRandomNum()
	}
	
	certificate = { //将数据传出来,设置成公共的
		"name":cname,
		"language":language,
		"type":ctype,
		"description":description,
		"issuer":issuer,
		"recipient":recipient,
		"assertion":assertion
	}
	
	$("#stuInfo").JSONView(certificate);	
	$("#json-collasped").JSONView(certificate, { collapsed: true });
	
}


function agreedCertificate(){
	
	id = $("#hid").val();
	message = certificate["assertion"]["uid"];
	var hash = CryptoJS.SHA256(message);
	
	
	//var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, "Passphrase");
	//var hmac = CryptoJS.HmacSHA256("222", "222");
	
	//var hmac = hmacHasher.finalize('message');
	//alert(hmac)
	
	
	var publickey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQAB"
		
	var privatekey = "MIICXQIBAAKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQ"
						+"WMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNR"	
						+"aY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQAB"	
						+"AoGAfY9LpnuWK5Bs50UVep5c93SJdUi82u7yMx4iHFMc/Z2hfenfYEzu+57fI4fv"	
						+"xTQ//5DbzRR/XKb8ulNv6+CHyPF31xk7YOBfkGI8qjLoq06V+FyBfDSwL8KbLyeH"	
						+"m7KUZnLNQbk8yGLzB3iYKkRHlmUanQGaNMIJziWOkN+N9dECQQD0ONYRNZeuM8zd"	
						+"8XJTSdcIX4a3gy3GGCJxOzv16XHxD03GW6UNLmfPwenKu+cdrQeaqEixrCejXdAF"	
						+"z/7+BSMpAkEA8EaSOeP5Xr3ZrbiKzi6TGMwHMvC7HdJxaBJbVRfApFrE0/mPwmP5"	
						+"rN7QwjrMY+0+AbXcm8mRQyQ1+IGEembsdwJBAN6az8Rv7QnD/YBvi52POIlRSSIM"	
						+"V7SwWvSK4WSMnGb1ZBbhgdg57DXaspcwHsFV7hByQ5BvMtIduHcT14ECfcECQATe"	
						+"aTgjFnqE/lQ22Rk0eGaYO80cc643BXVGafNfd9fcvwBMnk0iGX0XRsOozVt5Azil"	
						+"psLBYuApa66NcVHJpCECQQDTjI2AQhFc1yRnCU/YgDnSpJVm1nASoRUnU8Jfm3Oz"	
						+"uku7JUXcVpt08DFSceCEX9unCuMcT72rAQlLpdZir876"	
						
	 var encrypt = new JSEncrypt();
	 encrypt.setPublicKey(publickey);
     var encrypted = encrypt.encrypt(hash+"");
     
     // Decrypt with the private key...
     var decrypt = new JSEncrypt();
     decrypt.setPrivateKey(privatekey);
     var uncrypted = decrypt.decrypt(encrypted);
     

	 certificate["signature"] = encrypted
    
     
     var doc = {
		 "r_id":getRandomNum(),
		 "isHashed":"0",
		 "certificate":certificate,
		 "issuedOn": getNowFormatDate(),
		 "recipient":certificate["recipient"]["givenName"] + '   ' +certificate["recipient"]["familyName"],
		 "issuer" : certificate["issuer"]["name"]
	 }
	 
	 docu = JSON.stringify(doc)
	 var postData = {"docu":docu,"r_id":id};
	
	 $.post("/insertUnIssueCertifacte",postData, function(result) {
	   if(result==1){
		   loadAllApplyCertificateList();
		   //$("#stuInfo").html("");
		   $('#myModal').modal('hide');
	   }
     });
}

/* function to determine what we are redeeming from */
function redeemingFrom(string){
	var r = {};
	var decode = coinjs.addressDecode(string);
	if(decode.version == coinjs.pub){ // regular address
		r.addr = string;
		r.from = 'address';
		r.isMultisig = false;
	} else if (decode.version == coinjs.priv){ // wif key
		var a = coinjs.wif2address(string);
		r.addr = a['address'];
		r.from = 'wif';
		r.isMultisig = false;
	} else if (decode.version == coinjs.multisig){ // mulisig address
		r.addr = '';
		r.from = 'multisigAddress';
		r.isMultisig = false;
	} else {
		var script = coinjs.script();
		var decodeRs = script.decodeRedeemScript(string);
		if(decodeRs){ // redeem script
			r.addr = decodeRs['address'];
			r.from = 'redeemScript';
			r.decodedRs = decodeRs;
			r.isMultisig = true; // not quite, may be hodl
		} else { // something else
			r.addr = '';
			r.from = 'other';
			r.isMultisig = false;
		}
	}
	return r;
}










