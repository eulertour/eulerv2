var Module=typeof pyodide._module!=="undefined"?pyodide._module:{};Module.checkABI(1);if(!Module.expectedDataFileDownloads){Module.expectedDataFileDownloads=0;Module.finishedDataFileDownloads=0}Module.expectedDataFileDownloads++;(function(){var loadPackage=function(metadata){var PACKAGE_PATH;if(typeof window==="object"){PACKAGE_PATH=window["encodeURIComponent"](window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/")}else if(typeof location!=="undefined"){PACKAGE_PATH=encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/")}else{throw"using preloaded data can only be done on a web page or in a web worker"}var PACKAGE_NAME="manimlib.data";var REMOTE_PACKAGE_BASE="manimlib.data";if(typeof Module["locateFilePackage"]==="function"&&!Module["locateFile"]){Module["locateFile"]=Module["locateFilePackage"];err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")}var REMOTE_PACKAGE_NAME=Module["locateFile"]?Module["locateFile"](REMOTE_PACKAGE_BASE,""):REMOTE_PACKAGE_BASE;var REMOTE_PACKAGE_SIZE=metadata.remote_package_size;var PACKAGE_UUID=metadata.package_uuid;function fetchRemotePackage(packageName,packageSize,callback,errback){var xhr=new XMLHttpRequest;xhr.open("GET",packageName,true);xhr.responseType="arraybuffer";xhr.onprogress=function(event){var url=packageName;var size=packageSize;if(event.total)size=event.total;if(event.loaded){if(!xhr.addedTotal){xhr.addedTotal=true;if(!Module.dataFileDownloads)Module.dataFileDownloads={};Module.dataFileDownloads[url]={loaded:event.loaded,total:size}}else{Module.dataFileDownloads[url].loaded=event.loaded}var total=0;var loaded=0;var num=0;for(var download in Module.dataFileDownloads){var data=Module.dataFileDownloads[download];total+=data.total;loaded+=data.loaded;num++}total=Math.ceil(total*Module.expectedDataFileDownloads/num);if(Module["setStatus"])Module["setStatus"]("Downloading data... ("+loaded+"/"+total+")")}else if(!Module.dataFileDownloads){if(Module["setStatus"])Module["setStatus"]("Downloading data...")}};xhr.onerror=function(event){throw new Error("NetworkError for: "+packageName)};xhr.onload=function(event){if(xhr.status==200||xhr.status==304||xhr.status==206||xhr.status==0&&xhr.response){var packageData=xhr.response;callback(packageData)}else{throw new Error(xhr.statusText+" : "+xhr.responseURL)}};xhr.send(null)}function handleError(error){console.error("package error:",error)}var fetchedCallback=null;var fetched=Module["getPreloadedPackage"]?Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE):null;if(!fetched)fetchRemotePackage(REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE,function(data){if(fetchedCallback){fetchedCallback(data);fetchedCallback=null}else{fetched=data}},handleError);function runWithFS(){function assert(check,msg){if(!check)throw msg+(new Error).stack}Module["FS_createPath"]("/","lib",true,true);Module["FS_createPath"]("/lib","python3.7",true,true);Module["FS_createPath"]("/lib/python3.7","site-packages",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages","manimlib-0.1.11.dev181-py3.7.egg-info",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages","manimlib",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib","web",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib/web","tex_points",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib","scene",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib","files",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib","animation",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib","utils",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib","mobject",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib/mobject","types",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib/mobject","svg",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib","camera",true,true);Module["FS_createPath"]("/lib/python3.7/site-packages/manimlib","container",true,true);Module["FS_createPath"]("/","bin",true,true);function DataRequest(start,end,audio){this.start=start;this.end=end;this.audio=audio}DataRequest.prototype={requests:{},open:function(mode,name){this.name=name;this.requests[name]=this;Module["addRunDependency"]("fp "+this.name)},send:function(){},onload:function(){var byteArray=this.byteArray.subarray(this.start,this.end);this.finish(byteArray)},finish:function(byteArray){var that=this;Module["FS_createPreloadedFile"](this.name,null,byteArray,true,true,function(){Module["removeRunDependency"]("fp "+that.name)},function(){if(that.audio){Module["removeRunDependency"]("fp "+that.name)}else{err("Preloading file "+that.name+" failed")}},false,true);this.requests[this.name]=null}};function processPackageData(arrayBuffer){Module.finishedDataFileDownloads++;assert(arrayBuffer,"Loading data file failed.");assert(arrayBuffer instanceof ArrayBuffer,"bad input to processPackageData");var byteArray=new Uint8Array(arrayBuffer);var curr;var compressedData={data:null,cachedOffset:1034974,cachedIndexes:[-1,-1],cachedChunks:[null,null],offsets:[0,965,2028,3356,4606,5983,7422,8749,9768,10920,12164,13488,14677,15917,16707,17575,18731,19870,20933,21994,22871,23777,24718,25667,26723,27854,28812,29887,30830,32106,33195,34345,35517,36618,37652,38695,39714,40477,41498,42519,43464,44641,45633,46880,47900,48910,49840,50997,52096,53141,54268,55317,56528,57398,58659,59689,60560,61594,62751,63831,65006,66197,67118,68409,69469,70585,71709,72727,73835,74997,76122,77255,78398,79436,80620,81647,82728,83815,84755,85713,86790,87650,88812,89820,91050,92067,93189,94217,95171,96262,97343,98528,99470,100621,101645,102799,103743,104930,106005,107052,107896,108989,110084,111225,112462,113448,114709,115772,116835,117915,119008,120056,121292,122488,123607,124729,125820,126897,127918,128896,130080,131165,132246,133236,134204,135307,136320,137320,138356,139334,140191,141212,142278,143157,144241,145487,146546,147571,148571,149660,150671,151710,152621,153775,154938,156059,157143,158106,159075,160105,160989,161919,162782,163847,164816,165698,166839,167638,168663,169700,170851,171912,172978,173941,174830,175839,176870,177714,178783,179794,180817,181848,182964,184156,185106,186259,187470,188482,189451,190587,191540,192564,193642,194829,195875,196943,197869,198929,200009,200822,201916,202859,203813,204864,205791,206812,207880,208807,209792,210756,211565,212452,213556,214521,215531,216340,217327,218357,219233,220235,221363,222158,223248,224168,225329,226335,227332,228318,229344,230507,231602,232631,233650,234638,235642,236679,237641,238478,239362,240416,241344,242316,243340,244472,245475,246495,247325,248436,249497,250448,251498,252450,253382,254455,255665,256561,257526,258523,259330,260337,261441,262361,263521,264440,265530,266647,267457,268570,269483,270542,271564,272617,273841,274951,276050,277019,278065,279217,280173,280979,281940,282946,284090,285086,285916,286914,287892,288967,289956,290813,291745,292873,294048,295040,296059,297035,298102,299124,300230,301079,302042,303072,304075,305168,306019,307064,307981,309115,310069,311086,312076,313144,314251,315135,316258,317342,318434,319497,320648,321617,322668,323679,324705,325768,326782,327708,328528,329502,330589,331639,332584,333561,334614,335551,336506,337442,338304,339294,340396,341318,342381,343339,344282,345084,346087,347152,348344,349359,350343,351497,352527,353388,354309,355438,356535,357694,358596,359766,360730,361917,363062,363970,365117,366084,367015,368142,369051,370133,371182,372468,373670,374501,375596,376589,377671,378619,379732,380764,381695,382773,383893,384923,385913,386960,387928,389128,390273,391356,392414,393366,394301,395289,396418,397361,398357,399418,400422,401427,402438,403285,404472,405381,406460,407294,408265,409104,410225,411195,412082,413196,413976,415009,416055,417224,418297,419317,420339,421205,422279,423141,424107,425162,426087,427191,428230,429236,430399,431481,432483,433701,434883,435777,436885,437877,438910,439908,441097,442177,443254,444463,445321,446325,447204,448362,449314,450319,451282,452229,453215,454410,455501,456597,457657,458613,459761,460776,461817,462801,463816,465058,466036,467103,468150,469122,470111,471131,472123,473141,474068,475075,476093,477157,478219,479199,479993,480928,482065,483321,484592,485528,486608,487558,488603,489615,490569,491483,492372,493356,494189,495147,496262,497169,498255,499218,500140,500958,501945,503002,504203,505239,506234,507375,508418,509273,510194,511250,512335,513523,514423,515541,516600,517688,518661,519876,520976,522064,523188,524239,525355,526509,527531,528522,529652,530655,531734,532823,533790,534663,535551,536489,537611,538590,539666,540668,541754,542664,543641,544615,545547,546429,547553,548494,549489,550554,551500,552341,553266,554386,555473,556624,557542,558674,559667,560543,561425,562431,563507,564741,565758,566781,567931,568874,569903,571015,572206,573284,574357,575602,576731,577754,578866,579907,580833,582007,582911,583955,585179,586478,587474,588459,589512,590437,591552,592472,593589,594577,595642,596739,597890,598683,599863,600777,601661,602659,603782,604699,605783,606720,607670,608619,609774,610884,611913,613066,613912,614915,615878,616873,618070,619147,620192,621208,622155,623244,624326,625260,626380,627193,628088,629030,630112,631042,632064,633192,634439,635639,636533,637607,638554,639624,640580,641545,642527,643729,644826,645905,647045,647878,648914,649815,650702,651823,652882,653818,654872,655791,656886,657930,658914,659944,660884,662103,663041,664106,665215,666185,667112,668021,669005,669854,670817,671943,672853,673959,674890,675838,676627,677620,678702,679884,680882,681880,683011,684027,684890,685801,686867,687980,689143,690092,691220,692276,693311,694307,695528,696639,697711,698879,700115,701077,702185,703295,704328,705328,706342,707296,708409,709685,710918,711804,712878,713838,714912,715863,716967,717974,718953,719968,720906,721829,722803,723673,724622,725723,726631,727710,728672,729609,730445,731439,732517,733700,734693,735697,736820,737849,738696,739613,740693,741776,742917,743820,744966,745966,746979,747974,749150,750236,751293,752455,753744,754698,755811,756967,757986,758917,760035,760965,762029,763263,764555,765521,766544,767484,768493,769513,770559,771668,772609,773717,774581,775606,776776,777785,778801,779809,781043,781905,783087,784100,784995,786029,787048,787895,788992,790103,791251,792258,793382,794346,795460,796420,797490,798460,799649,800690,801630,802634,803699,804595,805543,806421,807581,808597,809563,810591,811495,812471,813520,814491,815653,816801,817867,818945,820010,821080,822075,823088,824014,824997,826042,827322,828613,829986,831102,831974,833025,833879,834850,835677,836662,837536,838500,839586,840650,841668,842677,843860,844726,845852,846997,847985,848929,850127,851238,852410,853500,854548,855609,856341,857088,858111,859183,860471,861765,863005,864209,865422,866624,867857,869154,870251,871336,872643,873791,875137,876397,877741,879130,880012,881196,882091,883208,884305,885105,885980,887097,888159,889404,890458,891463,892607,893719,894770,895887,896978,898200,899246,900317,901474,902630,903713,904826,906015,907084,908251,909109,910188,911230,912429,913494,914475,915594,916504,917579,918459,919502,920604,921610,922507,923501,924272,925464,926278,927080,928072,929135,930221,931078,932168,933057,934101,935096,936118,936978,938024,939055,940111,941047,941988,942917,943954,944985,946077,947321,948422,949325,950341,951472,952596,953587,954619,955647,956839,957943,959042,959996,961149,961998,963079,964292,965448,966193,967047,967840,968812,969814,970859,971856,973117,974075,975245,976371,977438,978441,979302,980259,981147,982268,983429,984503,985331,986443,987459,988518,989421,990596,991518,992459,993378,994406,995440,996511,997612,998690,999806,1000998,1002079,1003222,1004314,1005311,1006334,1007533,1008456,1009597,1010615,1011612,1012270,1013102,1014144,1015299,1016328,1017422,1018675,1019652,1020558,1021653,1022552,1023629,1024511,1025453,1026674,1027625,1028710,1029760,1030856,1031925,1033033,1034281],sizes:[965,1063,1328,1250,1377,1439,1327,1019,1152,1244,1324,1189,1240,790,868,1156,1139,1063,1061,877,906,941,949,1056,1131,958,1075,943,1276,1089,1150,1172,1101,1034,1043,1019,763,1021,1021,945,1177,992,1247,1020,1010,930,1157,1099,1045,1127,1049,1211,870,1261,1030,871,1034,1157,1080,1175,1191,921,1291,1060,1116,1124,1018,1108,1162,1125,1133,1143,1038,1184,1027,1081,1087,940,958,1077,860,1162,1008,1230,1017,1122,1028,954,1091,1081,1185,942,1151,1024,1154,944,1187,1075,1047,844,1093,1095,1141,1237,986,1261,1063,1063,1080,1093,1048,1236,1196,1119,1122,1091,1077,1021,978,1184,1085,1081,990,968,1103,1013,1e3,1036,978,857,1021,1066,879,1084,1246,1059,1025,1e3,1089,1011,1039,911,1154,1163,1121,1084,963,969,1030,884,930,863,1065,969,882,1141,799,1025,1037,1151,1061,1066,963,889,1009,1031,844,1069,1011,1023,1031,1116,1192,950,1153,1211,1012,969,1136,953,1024,1078,1187,1046,1068,926,1060,1080,813,1094,943,954,1051,927,1021,1068,927,985,964,809,887,1104,965,1010,809,987,1030,876,1002,1128,795,1090,920,1161,1006,997,986,1026,1163,1095,1029,1019,988,1004,1037,962,837,884,1054,928,972,1024,1132,1003,1020,830,1111,1061,951,1050,952,932,1073,1210,896,965,997,807,1007,1104,920,1160,919,1090,1117,810,1113,913,1059,1022,1053,1224,1110,1099,969,1046,1152,956,806,961,1006,1144,996,830,998,978,1075,989,857,932,1128,1175,992,1019,976,1067,1022,1106,849,963,1030,1003,1093,851,1045,917,1134,954,1017,990,1068,1107,884,1123,1084,1092,1063,1151,969,1051,1011,1026,1063,1014,926,820,974,1087,1050,945,977,1053,937,955,936,862,990,1102,922,1063,958,943,802,1003,1065,1192,1015,984,1154,1030,861,921,1129,1097,1159,902,1170,964,1187,1145,908,1147,967,931,1127,909,1082,1049,1286,1202,831,1095,993,1082,948,1113,1032,931,1078,1120,1030,990,1047,968,1200,1145,1083,1058,952,935,988,1129,943,996,1061,1004,1005,1011,847,1187,909,1079,834,971,839,1121,970,887,1114,780,1033,1046,1169,1073,1020,1022,866,1074,862,966,1055,925,1104,1039,1006,1163,1082,1002,1218,1182,894,1108,992,1033,998,1189,1080,1077,1209,858,1004,879,1158,952,1005,963,947,986,1195,1091,1096,1060,956,1148,1015,1041,984,1015,1242,978,1067,1047,972,989,1020,992,1018,927,1007,1018,1064,1062,980,794,935,1137,1256,1271,936,1080,950,1045,1012,954,914,889,984,833,958,1115,907,1086,963,922,818,987,1057,1201,1036,995,1141,1043,855,921,1056,1085,1188,900,1118,1059,1088,973,1215,1100,1088,1124,1051,1116,1154,1022,991,1130,1003,1079,1089,967,873,888,938,1122,979,1076,1002,1086,910,977,974,932,882,1124,941,995,1065,946,841,925,1120,1087,1151,918,1132,993,876,882,1006,1076,1234,1017,1023,1150,943,1029,1112,1191,1078,1073,1245,1129,1023,1112,1041,926,1174,904,1044,1224,1299,996,985,1053,925,1115,920,1117,988,1065,1097,1151,793,1180,914,884,998,1123,917,1084,937,950,949,1155,1110,1029,1153,846,1003,963,995,1197,1077,1045,1016,947,1089,1082,934,1120,813,895,942,1082,930,1022,1128,1247,1200,894,1074,947,1070,956,965,982,1202,1097,1079,1140,833,1036,901,887,1121,1059,936,1054,919,1095,1044,984,1030,940,1219,938,1065,1109,970,927,909,984,849,963,1126,910,1106,931,948,789,993,1082,1182,998,998,1131,1016,863,911,1066,1113,1163,949,1128,1056,1035,996,1221,1111,1072,1168,1236,962,1108,1110,1033,1e3,1014,954,1113,1276,1233,886,1074,960,1074,951,1104,1007,979,1015,938,923,974,870,949,1101,908,1079,962,937,836,994,1078,1183,993,1004,1123,1029,847,917,1080,1083,1141,903,1146,1e3,1013,995,1176,1086,1057,1162,1289,954,1113,1156,1019,931,1118,930,1064,1234,1292,966,1023,940,1009,1020,1046,1109,941,1108,864,1025,1170,1009,1016,1008,1234,862,1182,1013,895,1034,1019,847,1097,1111,1148,1007,1124,964,1114,960,1070,970,1189,1041,940,1004,1065,896,948,878,1160,1016,966,1028,904,976,1049,971,1162,1148,1066,1078,1065,1070,995,1013,926,983,1045,1280,1291,1373,1116,872,1051,854,971,827,985,874,964,1086,1064,1018,1009,1183,866,1126,1145,988,944,1198,1111,1172,1090,1048,1061,732,747,1023,1072,1288,1294,1240,1204,1213,1202,1233,1297,1097,1085,1307,1148,1346,1260,1344,1389,882,1184,895,1117,1097,800,875,1117,1062,1245,1054,1005,1144,1112,1051,1117,1091,1222,1046,1071,1157,1156,1083,1113,1189,1069,1167,858,1079,1042,1199,1065,981,1119,910,1075,880,1043,1102,1006,897,994,771,1192,814,802,992,1063,1086,857,1090,889,1044,995,1022,860,1046,1031,1056,936,941,929,1037,1031,1092,1244,1101,903,1016,1131,1124,991,1032,1028,1192,1104,1099,954,1153,849,1081,1213,1156,745,854,793,972,1002,1045,997,1261,958,1170,1126,1067,1003,861,957,888,1121,1161,1074,828,1112,1016,1059,903,1175,922,941,919,1028,1034,1071,1101,1078,1116,1192,1081,1143,1092,997,1023,1199,923,1141,1018,997,658,832,1042,1155,1029,1094,1253,977,906,1095,899,1077,882,942,1221,951,1085,1050,1096,1069,1108,1248,693],successes:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]};compressedData.data=byteArray;assert(typeof Module.LZ4==="object","LZ4 not present - was your app build with  -s LZ4=1  ?");Module.LZ4.loadPackage({metadata:metadata,compressedData:compressedData});Module["removeRunDependency"]("datafile_manimlib.data")}Module["addRunDependency"]("datafile_manimlib.data");if(!Module.preloadResults)Module.preloadResults={};Module.preloadResults[PACKAGE_NAME]={fromCache:false};if(fetched){processPackageData(fetched);fetched=null}else{fetchedCallback=processPackageData}}if(Module["calledRun"]){runWithFS()}else{if(!Module["preRun"])Module["preRun"]=[];Module["preRun"].push(runWithFS)}};loadPackage({files:[{filename:"/lib/python3.7/site-packages/manimlib-0.1.11.dev181-py3.7.egg-info/top_level.txt",start:0,end:9,audio:0},{filename:"/lib/python3.7/site-packages/manimlib-0.1.11.dev181-py3.7.egg-info/SOURCES.txt",start:9,end:3518,audio:0},{filename:"/lib/python3.7/site-packages/manimlib-0.1.11.dev181-py3.7.egg-info/pbr.json",start:3518,end:3566,audio:0},{filename:"/lib/python3.7/site-packages/manimlib-0.1.11.dev181-py3.7.egg-info/PKG-INFO",start:3566,end:12551,audio:0},{filename:"/lib/python3.7/site-packages/manimlib-0.1.11.dev181-py3.7.egg-info/dependency_links.txt",start:12551,end:12552,audio:0},{filename:"/lib/python3.7/site-packages/manimlib-0.1.11.dev181-py3.7.egg-info/not-zip-safe",start:12552,end:12553,audio:0},{filename:"/lib/python3.7/site-packages/manimlib-0.1.11.dev181-py3.7.egg-info/requires.txt",start:12553,end:12646,audio:0},{filename:"/lib/python3.7/site-packages/manimlib-0.1.11.dev181-py3.7.egg-info/entry_points.txt",start:12646,end:12687,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/ctex_template.tex",start:12687,end:13181,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/media_dir.txt",start:13181,end:13186,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/extract_scene.py",start:13186,end:18120,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/constants.py",start:18120,end:25568,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/config.py",start:25568,end:34315,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/tex_template.tex",start:34315,end:34862,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/__init__.py",start:34862,end:36859,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/imports.py",start:36859,end:40489,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/utils.py",start:40489,end:53608,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/web_scene.py",start:53608,end:57508,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/web_mock.py",start:57508,end:57757,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6}",start:57757,end:138570,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\sum_{k=1}^\\infty {1 \\over k^2} = {\\pi^2 \\over 6}",start:138570,end:227166,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/a",start:227166,end:234860,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\textrm{can we do?}",start:234860,end:301489,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\textrm{That was a non-linear function \\\\applied to the grid}",start:301489,end:658487,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\textrm{This is some \\LaTeX}",start:658487,end:798869,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\textrm{That was a transform}",start:798869,end:969598,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\textrm{This is a grid}",start:969598,end:1072945,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\textrm{text}",start:1072945,end:1179410,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\textrm{What animations}",start:1179410,end:1319887,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\textrm{This is a some}",start:1319887,end:1426352,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/web/tex_points/\\textrm{This is a some text}",start:1426352,end:1564437,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/scene/moving_camera_scene.py",start:1564437,end:1565607,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/scene/media_dir.txt",start:1565607,end:1565612,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/scene/scene.py",start:1565612,end:1584102,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/scene/reconfigurable_scene.py",start:1584102,end:1586149,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/scene/three_d_scene.py",start:1586149,end:1592582,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/scene/sample_space_scene.py",start:1592582,end:1597884,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/scene/vector_space_scene.py",start:1597884,end:1616397,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/scene/graph_scene.py",start:1616397,end:1635983,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/scene/zoomed_scene.py",start:1635983,end:1639496,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/files/Bubbles_thought.svg",start:1639496,end:1640839,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/files/Bubbles_speech.svg",start:1640839,end:1641555,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/files/PiCreatures_plain.svg",start:1641555,end:1643392,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/creation.py",start:1643392,end:1649725,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/movement.py",start:1649725,end:1652909,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/fading.py",start:1652909,end:1657988,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/growing.py",start:1657988,end:1660170,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/composition.py",start:1660170,end:1665661,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/numbers.py",start:1665661,end:1667918,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/indication.py",start:1667918,end:1677177,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/specialized.py",start:1677177,end:1680309,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/rotation.py",start:1680309,end:1682067,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/update.py",start:1682067,end:1683829,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/animation.py",start:1683829,end:1689272,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/animation/transform.py",start:1689272,end:1702869,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/color.py",start:1702869,end:1705610,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/bezier.py",start:1705610,end:1710170,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/paths.py",start:1710170,end:1711594,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/space_ops.py",start:1711594,end:1717462,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/simple_functions.py",start:1717462,end:1719739,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/tex_file_writing.py",start:1719739,end:1722655,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/file_ops.py",start:1722655,end:1724660,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/debug.py",start:1724660,end:1725320,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/images.py",start:1725320,end:1725934,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/strings.py",start:1725934,end:1727797,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/rate_functions.py",start:1727797,end:1729963,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/iterables.py",start:1729963,end:1733081,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/config_ops.py",start:1733081,end:1735882,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/utils/sounds.py",start:1735882,end:1736621,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/three_d_utils.py",start:1736621,end:1738257,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/mobject_update_utils.py",start:1738257,end:1740915,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/three_d_shading_utils.py",start:1740915,end:1742380,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/changing.py",start:1742380,end:1746389,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/shape_matchers.py",start:1746389,end:1749793,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/frame.py",start:1749793,end:1751314,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/three_dimensions.py",start:1751314,end:1756078,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/number_line.py",start:1756078,end:1762567,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/functions.py",start:1762567,end:1766185,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/numbers.py",start:1766185,end:1771096,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/matrix.py",start:1771096,end:1777176,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/vector_field.py",start:1777176,end:1789576,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/probability.py",start:1789576,end:1797738,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/geometry.py",start:1797738,end:1831729,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/mobject.py",start:1831729,end:1871441,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/value_tracker.py",start:1871441,end:1873141,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/coordinate_systems.py",start:1873141,end:1887767,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/types/image_mobject.py",start:1887767,end:1891948,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/types/point_cloud_mobject.py",start:1891948,end:1901448,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/types/vectorized_mobject.py",start:1901448,end:1935924,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/svg/drawings.py",start:1935924,end:1973744,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/svg/tex_mobject.py",start:1973744,end:1987705,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/svg/brace.py",start:1987705,end:1993067,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/mobject/svg/svg_mobject.py",start:1993067,end:2009114,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/camera/moving_camera.py",start:2009114,end:2012220,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/camera/mapping_camera.py",start:2012220,end:2016723,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/camera/three_d_camera.py",start:2016723,end:2025230,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/camera/multi_camera.py",start:2025230,end:2027470,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/camera/camera.py",start:2027470,end:2044023,audio:0},{filename:"/lib/python3.7/site-packages/manimlib/container/container.py",start:2044023,end:2044731,audio:0},{filename:"/bin/manim",start:2044731,end:2044903,audio:0}],remote_package_size:1039070,package_uuid:"4e69e50a-807e-464b-b107-f08937a0af10"})})();