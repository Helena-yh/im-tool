;
(function (RCS) {
	var utils = RCS.utils;
	var emoji = RCS.emoji;
	var render = utils.render;
	var conversation = {};
	conversation.lastSendTime = 0;
	conversation.messageContent = [];
	var userId = '';
	var targetId = ''; //保存收集用户信息的相关数据
	var role = '';
	var templates = {};
	var $ = utils.$;
	var terminal;
	var supportNot = false; //页面是否支持notification
	var saveCustomTargetId = 'RongCloud';

	//加载模板
	var getTemplates = function (callback) {
		templates = RCS.getTemplates();
		callback && callback();
	}

	//键盘回车发送
	var keySend = function (event) {
		if (event.keyCode == '13' && !event.shiftKey) {
			event.preventDefault()
			send();
		} else {
			inputChange();
		}
	}
	//发送
	var send = function () {
		var inputMsg = $(".rongcloud-text")[0];
		var message = inputMsg.value;
		if (message) {
			message = emoji.symbolToEmoji(message);
			sendMessage(new RongIMLib.TextMessage({
				content: message,
				extra: "附加信息"
			}));
			inputMsg.value = '';
			inputMsg.focus();
		}
	}
	//每6秒执行一次正在输入消息发送
	var inputChange = function () {
		var timespan = new Date().getTime() - conversation.lastSendTime;
		if (timespan > 1000 * 6) {
			conversation.lastSendTime += timespan;
			sendTyping();
		}
	}
	//正在输入中
	var sendTyping = function () {
		if (conversation.targetType == RongIMLib.ConversationType.CUSTOMER_SERVICE) {
			var msg = new RongIMLib.TypingStatusMessage({
				typingContentType: 'RC:TxtMsg',
				data: null
			});
			var callback = function () { };
			sendMessage(msg, callback);
		}
	}
	//显示表情
	var showemoji = function (event) {
		event.stopPropagation();
		var emojiContent = $('.rongcloud-expressionWrap')[0];
		if (emojiContent.style.display == 'none') {
			utils.show(emojiContent);
		} else {
			utils.hide(emojiContent);
		}
	}
	//表情点击
	var chooseEmoji = function (event) {
		event.stopPropagation();
		var emojiContent = $('.rongcloud-expressionWrap')[0];
		var thisTarget = event.target || event.srcElement;
		var textArea = $('.rongcloud-text')[0];
		var emojiName = thisTarget.getAttribute('name');
		if (emojiName) {
			textArea.value += emojiName;
			utils.hide(emojiContent);
			if (terminal == 'pc') {
				textArea.focus();
				range = document.createRange();
				range.selectNodeContents(textArea);
				range.collapse(true);
				range.setEnd(textArea, textArea.childNodes.length);
				range.setStart(textArea, textArea.childNodes.length);
				sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
	}

	function textMessageFormat(content) {
		if (content.length === 0) {
			return '';
		}

		content = utils.encodeHtmlStr(content);

		content = utils.replaceUri(content, function (uri, protocol) {
			var link = uri;
			if (!protocol) {
				link = 'http://' + uri;
			}
			return '<a class="rong-link-site" target="_blank" href="' + link + '">' + uri + '</a>';
		});

		content = utils.replaceEmail(content, function (email) {
			return '<a class="rong-link-email" href="mailto:' + email + '">' + email + '<a>';
		});

		return emoji.emojiToHTML(content, 18);
	}

	//发送消息
	var sendMessage = function (msg, callback) {
		// var targetId = conversation.id; // 目标 Id
		RongIMClient.getInstance().sendMessage(RongIMLib.ConversationType.PRIVATE, targetId, msg, {
			// 发送消息成功
			onSuccess: function (message) {
				console.log(message);
				//message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
				console.log("Send successfully");
				callback && callback();
				if (!callback) {
					// updateConversationList();
					updateMessage(message);
				}
			},
			onError: function (errorCode, message) {
				var info = '';
				switch (errorCode) {
					case RongIMLib.ErrorCode.TIMEOUT:
						info = '超时';
						break;
					case RongIMLib.ErrorCode.UNKNOWN_ERROR:
						info = '未知错误';
						break;
					case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
						info = '在黑名单中，无法向对方发送消息';
						break;
					case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
						info = '不在讨论组中';
						break;
					case RongIMLib.ErrorCode.NOT_IN_GROUP:
						info = '不在群组中';
						break;
					case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
						info = '不在聊天室中';
						break;
					default:
						info = x;
						break;
				}
				console.log('发送失败:' + info);
			}
		});
	}

	//显示新消息
	var updateMessage = function (message) {
		if (message.messageType == 'ReadReceiptMessage') {
			return; //ReadReceiptMessage的messageType
		}
		conversation.messageContent.push(message);
		var newMessage = modifyMessage(utils.cloneObj(message));
		if (message.messageDirection != 1 && supportNot) {
			pushMessage(newMessage);
		}
		var messageList = $(".rcs-message-box")[0];
		if (!messageList) {
			return;
		}
		if (newMessage.sentTime - conversation.lastSendTime >= 60000) { //超过1分钟
			var messageTime = {};
			messageTime.content = {};
			messageTime.messageType = 'TimeMessage';
			messageTime.sentTime = utils.getTime(newMessage.sentTime);
			messageList.innerHTML += render(templates.imMessageTemplate, messageTime);
			conversation.lastSendTime = newMessage.sentTime;
		}
		newMessage.role = role;
		messageList.innerHTML += render(templates.imMessageTemplate, newMessage);
		messageList.scrollTop = messageList.scrollHeight;
	}

	//web push message
	var pushMessage = function (msg) {
		if (terminal == 'pc') {
			var title = '消息提醒';
			var options = {
				body: "您有一条新消息，请及时回复",
				icon: (msg.content.user && msg.content.user.icon) ? msg.content.user.icon : "./images/kefu.png",
			};
			var notification = new Notification(title, options);

			notification.onclick = function (event) {
				window.focus();
				notification.close();
			}
			notification.onshow = function () {
				setTimeout(function () {
					notification.close();
				}, 5000);
			};
		}
	}

	//图片新消息图片加载完毕滚动到最下面
	var scrollBottom = function () {
		var messageList = $(".rcs-message-box")[0];
		messageList.scrollTop = messageList.scrollHeight;
	}
	//加载历史消息
	var loadHisMessages = function () {
		var callbacks = function (list, hasMsg) {
			var messageBox = $(".rcs-message-box")[0];
			var messageList = {};
			messageList.hasMore = hasMsg;
			messageList.list = modificateMessage(conversation.messageContent);
			var oldHeight = messageBox.scrollHeight;
			messageBox.innerHTML = render(templates.imMessage, messageList);
			var newHeight = messageBox.scrollHeight;
			messageBox.scrollTop = newHeight - oldHeight;
		}
		getHisMessage(null, 20, callbacks);
	}

	var createIMConversation = function (config) {
		$("#rcs-app")[0].innerHTML = render(templates.imMain);
		openConversation({ "lastSendTime": 0, "messageContent": [], "id": "11", "mcount": "0", "conversationType": "1" });
		$(".rcs-chat-custom-info")[0].innerHTML = render(templates.customInfo);
	}

	//进入指定会话
	var openConversation = function (conversation) {
		conversation.targetType = conversation.conversationType;
		var callbacks = function (list, hasMsg) {
			var data = {};
			var messageList = {};
			messageList.firstEnter = true;
			messageList.role = role;
			messageList.list = modificateMessage(list);

			data.messageList = render(templates.imMessage, messageList);
			// data.targetName = '用户：' + conversation.id;
			data.targetName = '融云技术支持聊天工具';
			data.terminal = terminal;
			$(".rcs-chat-wrapper")[0].innerHTML = render(templates.chat, data);
			scrollBottom();
			utils.hide($('.rongcloud-mode2')[0]);
			utils.show($('.rongcloud-mode1')[0]);
			//初始化表情
			var emojiList = emoji.getEmoji();
			var strHtml = '';
			for (var i = 0; i < emojiList.length; i++) {
				strHtml += '<div class="emojiItem">' + emojiList[i].outerHTML + '</div>';
			}
			$('.rongcloud-expressionContent')[0].innerHTML += strHtml;

			if (hasMsg) {
				$('.rongcloud-Messages-history')[0].style.display = 'block';
			}
		}
		var count = conversation.mcount < 5 ? 5 : (conversation.mcount > 20 ? 20 : conversation.mcount);
		getHisMessage(0, parseInt(count), callbacks);
	}

	//拉去消息记录
	var getHisMessage = function (timestrap, count, callbacks) {
		RongIMLib.RongIMClient.getInstance().getHistoryMessages(RongIMLib.ConversationType.PRIVATE, targetId, timestrap, count, {
			onSuccess: function (list, hasMsg) {
				console.info(JSON.stringify(list));
				conversation.messageContent = list.concat(conversation.messageContent);
				callbacks(list, hasMsg);
			},
			onError: function (error) {
				console.log("GetHistoryMessages,errorcode:" + error);
			}
		});
	}

	//单条消息修饰
	var modifyMessage = function (msg) {
		if (msg.messageType == 'TextMessage') {
			msg.content.content = textMessageFormat(msg.content.content);
		} else if (msg.messageType == 'FileMessage') {
			msg.content.size = utils.getFileSize(msg.content.size);
		}
		return msg;
	}

	//消息修饰，2条消息之间相差6000毫秒，显示消息发送时间
	var modificateMessage = function (list) {
		var listTemp = JSON.parse(JSON.stringify(list));
		var _list = [];
		for (var i = 0; i < listTemp.length; i++) {
			var messageTime = {
				sentTime: utils.getTime(listTemp[i].sentTime),
				messageType: 'TimeMessage'
			};
			var messageMap = [
				"TextMessage",
				"FileMessage",
				"SightMessage",
				"ImageMessage",
				"VoiceMessage",
				"RCCombineMessage"

			];
			if (messageMap.indexOf(listTemp[i].messageType) >= 0) {
				listTemp[i] = modifyMessage(listTemp[i]);
			} else {
				listTemp[i].messageType = 'UnknownMessage';
			}
			if (i == 0) {
				_list.push(messageTime);
			} else if (listTemp[i].sentTime - listTemp[i - 1].sentTime >= 60000) {
				_list.push(messageTime);
			}
			_list.push(listTemp[i]);
		}
		return _list;
	}

	//img上传图片
	var imgUpload = function (event) {
		var thisTarget = event.target || event.srcElement;
		var _file = thisTarget.files;
		for (var i = 0; i < _file.length; i++) {
			RCS.imageStartUpload(_file[i], function (data) {
				console.log("文件上传完成：", data);
				getFileUrl(data);
			});
		}
		thisTarget.value = '';
	}
	//上传文件
	var fileUpload = function (event) {
		var thisTarget = event.target || event.srcElement;
		var _file = thisTarget.files;
		for (var i = 0; i < _file.length; i++) {
			RCS.fileStartUpload(_file[i], function (data) {
				console.log("文件上传完成：", data);
				getFileUrl(data);
			});
		}
		thisTarget.value = '';
	}

	var urlItem = {
		file: function (data) {
			if (RCS.config.fileConfig && RCS.config.fileConfig.isPrivate) {
				if (data.rc_url.type == 1) {
					data.downloadUrl = data.rc_url.path;
				} else {
					data.downloadUrl = RCS.config.fileConfig.fileServer + data.rc_url.path;
				}
				var msg = messageItem[data.fileType](data);
				sendMessage(msg);
			} else {
				var fileType = RongIMLib.FileType.FILE;
				RongIMClient.getInstance().getFileUrl(fileType, data.filename, data.name, {
					onSuccess: function (result) {
						data.downloadUrl = result.downloadUrl;
						var msg = messageItem[data.fileType](data);
						sendMessage(msg);
					},
					onError: function (error) {
						showResult('getFileToken error:' + error);
					}
				});
			}
		},
		image: function (data) {
			if (RCS.config.upload && RCS.config.upload.isPrivate) {
				if (data.rc_url.type == 1) {
					data.downloadUrl = data.rc_url.path;
				} else {
					data.downloadUrl = RCS.config.upload.fileServer + data.rc_url.path;
				}
				var msg = messageItem[data.fileType](data);
				sendMessage(msg);
			} else {
				var fileType = RongIMLib.FileType.IMAGE;
				RongIMClient.getInstance().getFileUrl(fileType, data.filename, null, {
					onSuccess: function (result) {
						data.downloadUrl = result.downloadUrl;
						var msg = messageItem[data.fileType](data);
						sendMessage(msg);
					},
					onError: function (error) {
						console.log(error);
					}
				});
			}
		}
	};
	var messageItem = {
		file: function (file) {
			var name = file.name || '',
				index = name.lastIndexOf('.') + 1,
				type = name.substring(index);
			return new RongIMLib.FileMessage({
				name: file.name,
				size: file.size,
				type: type,
				fileUrl: file.downloadUrl
			});
		},
		image: function (image) {
			return new RongIMLib.ImageMessage({
				content: image.thumbnail,
				imageUri: image.downloadUrl
			});
		}
	};

	var getFileUrl = function (data) {
		urlItem[data.fileType](data);
	}

	//关闭聊天窗口
	var endConversation = function () {
		$('.rcs-chat-wrapper')[0].innerHTML = '';
	}

	//预览图片
	var viewImage = function (event) {
		var thisTarget = event.target || event.srcElement;
		var image = {
			imageUrl: thisTarget.getAttribute('data-img')
		}
		$('.imageViewBox')[0].innerHTML = render(templates.imageView, image);
		utils.fadein($('.imageViewBox')[0]);
	}
	var escImageView = function () {
		$('.imageViewBox')[0].innerHTML = '';
		utils.fadeout($('.imageViewBox')[0]);
	}

	//sdk初始化
	var sdkInit = function (params, callbacks) {
		var appKey = params.appKey;
		var token = params.token;
		RongIMLib.RongIMClient.init(appKey);

		var instance = RongIMClient.getInstance();

		// 连接状态监听器
		RongIMClient.setConnectionStatusListener({
			onChanged: function (status) {
				console.log(status);
				var connectDom = $('.rcs-connect-status')[0];
				if (connectDom) {
					connectDom.style.display = 'block';
				}
				switch (status) {
					case RongIMLib.ConnectionStatus.CONNECTED:
						if (connectDom) {
							connectDom.style.display = 'none';
						}
						callbacks.getInstance && callbacks.getInstance(instance);
						break;
					case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
						console.log('网络不可用');
						reconnect();
						break;
					case RongIMLib.ConnectionStatus.DISCONNECTED:
						console.log('断开连接');
						break;
					default:
						console.log('未知错误');
						break;
				}
			}
		});

		RongIMClient.setOnReceiveMessageListener({
			// 接收到的消息
			onReceived: function (message) {
				// 判断消息类型
				console.log("新消息: " + message.targetId);
				if (message.offLineMessage) {
					return;
				}
				console.log(message);
				updateMessage(message);
			}
		});

		//开始链接
		RongIMClient.connect(token, {
			onSuccess: function (userId) {
				console.log("链接成功，用户id：" + userId);
				registerMessage();
				if (role == 'admin') {
					getCustomInfo()
				}
			},
			onTokenIncorrect: function () {
				console.log('token无效');
			},
			onError: function (errorCode) {
				console.log("=============================================");
				console.log(errorCode);
			}
		});
	}
	var registerMessage = function () {
		var messageName = 'CustomInfo'; // 消息名称
		var objectName = 'CUSTOMINFO'; // 消息内置名称，请按照此格式命名
		var isCounted = true; // 消息计数
		var isPersited = true; // 消息保存
		var mesasgeTag = new RongIMLib.MessageTag(isCounted, isPersited);
		var prototypes = ['info']; // 消息类中的属性名
		RongIMClient.registerMessageType(messageName, objectName, mesasgeTag, prototypes);
	}
	//创建button
	var createButton = function (config) {
		config.target.innerHTML = render(templates.button);
		createIMConversation(config);
		addListener(config);
		adminUserRender();
	}

	var addListener = function (config) {
		var callback = function (phoneOrPc) {
			terminal = phoneOrPc;
		}
		utils.browserRedirect(callback);
		if (terminal == 'pc') {
			document.body.onclick = function () {
				hideEmoji();
			}
			if (Notification.permission === "granted") {
				supportNot = true;
			}
			// Otherwise, we need to ask the user for permission
			else if (Notification.permission !== "denied") {
				Notification.requestPermission(function (permission) {
					// If the user accepts, let's create a notification
					if (permission === "granted") {
						supportNot = true;
					}
				});
			}
		} else {
			document.body.ontouchstart = function (event) {
				if (event.target.className.indexOf('emojiItem') < 0 && event.target.className.indexOf('rong-emoji-content') < 0 && event.target.className.indexOf('rongcloud-expressionContent') < 0) {
					hideEmoji();
				}
				if (event.target.className.indexOf('rongcloud-rong-btn') < 0 && event.target.className.indexOf('rongcloud-text') < 0) {
					var inputMsg = $(".rongcloud-text")[0];
					if (inputMsg) {
						inputMsg.blur();
					}
				}
			}
		}
	}

	var hideEmoji = function () {
		var emojiContent = $('.rongcloud-expressionWrap')[0];
		if (emojiContent) {
			utils.hide(emojiContent);
		}
	}

	//im组件初始化
	var init = function (config) {
		RCS.config = config;
		config.isIM = true;
		userId = config.userId;
		role = config.role;
		role == 'custom' ? targetId = 'admin-' + userId : targetId = userId.substring(6, userId.length);
		var callbacks = {
			getInstance: function (instance) {
				var callback = function () {
					if (RCS.config.templates) {
						for (var index in RCS.config.templates) {
							templates[index] = RCS.config.templates[index];
						}
					}
				}
				getTemplates(callback);
				emoji.init();
				createButton(config);
			}
		}
		sdkInit(config, callbacks);
	}

	var getCustomInfo = function () {
		var conversationType = RongIMLib.ConversationType.PRIVATE;
		var count = 2;
		RongIMLib.RongIMClient.getInstance().getHistoryMessages(conversationType, saveCustomTargetId, 0, count, {
			onSuccess: function (list, hasMsg) {
				var msg;
				if (list.length == 0) {
					msg = {
						company: '无',
						orderId: '无',
						appkey: '无',
						SDKVersion: '无',
						issues: '无'
					}

				} else {
					msg = list[list.length - 1].content.info;
				}

				showCustomInfo(msg)
				console.log('获取历史消息成功', list);

			},
			onError: function (error) {
				// 请排查：单群聊消息云存储是否开通
				console.log('获取历史消息失败', error);
			}
		});
	}

	//H5唤醒键盘的时候输入框显示在视野内
	var keyboard = function (event) {
		var thisTarget = event.target || event.srcElement;
		setTimeout(function () {
			thisTarget.scrollIntoView(true);
		}, 500)
	}

	// var hideCustomEdit = function () {
	// 	var textNodes = $('.ci-mian-text');
	// 	for (var i = 0; i < textNodes.length; i++) {
	// 		textNodes[i].style.display = 'none';
	// 	}
	// 	var inputNodes = $('.ci-mian-inputbox');
	// 	for (var i = 0; i < inputNodes.length; i++) {
	// 		inputNodes[i].style.display = 'block';
	// 	}
	// 	$('.ci-footer-edit')[0].style.display = 'none';
	// 	$('.ci-footer-submit')[0].style.display = 'block';
	// 	$('.ci-footer-submit')[0].style.margin = '0 auto';
	// }
	// var hideCustomSubmit = function() {
	// 	var textNodes = $('.ci-mian-text');
	// 	for(var i=0; i< textNodes.length; i++) {
	// 		textNodes[i].style.display = 'block';
	// 	}
	// 	var inputNodes = $('.ci-mian-inputbox');
	// 	for(var i=0; i< inputNodes.length; i++) {
	// 		inputNodes[i].style.display = 'none';
	// 	}
	// 	$('.ci-footer-edit')[0].style.display = 'block';
	// 	$('.ci-footer-edit')[0].style.margin = '0 auto';
	// 	$('.ci-footer-submit')[0].style.display = 'none';
	// }
	//客户信息 编辑
	// var customEdit = function () {
	// 	hideCustomEdit();
	// 	//获取数据
	// 	var msg = {
	// 		company: $('#company')[0].value,
	// 		orderId: $('#orderId')[0].value,
	// 		appkey: $('#appkey')[0].value,
	// 		SDKVersion: $('#SDKVersion')[0].value,
	// 		issues: $('#issues')[0].value,
	// 	}
	// 	var inputNodes = $('.ci-mian-inputbox');
	// 	var textNodes = $('.ci-mian-text');
	// 	for (var i = 0; i < textNodes.length; i++) {
	// 		inputNodes[i].value = textNodes[i].innerText
	// 	}

	// }

	//客户信息 提交
	var customSubmit = function () {
		// hideCustomSubmit();
		//获取数据
		let msg = {
			company: $('#company')[0].value,
			orderId: $('#orderId')[0].value,
			appkey: $('#appkey')[0].value,
			SDKVersion: $('#SDKVersion')[0].value,
			issues: $('#issues')[0].value,
		}
		//发送消息
		sendCustomInfoMessage(msg);
		//渲染
		showCustomInfo(msg);
	}

	var showCustomInfo = function (msg) {
		//渲染
		var textNodes = $('.ci-mian-inputbox');
		textNodes[0].value = msg.company;
		textNodes[1].value = msg.orderId;
		textNodes[2].value = msg.appkey;
		textNodes[3].value = msg.SDKVersion;
		textNodes[4].value = msg.issues;
		// customEdit();
	}
	var sendCustomInfoMessage = function (msgInfo) {
		var conversationType = RongIMLib.ConversationType.PRIVATE;  //单聊, 其他会话选择相应的消息类型即可
		var msg = new RongIMClient.RegisterMessage.CustomInfo({ info: msgInfo });
		RongIMClient.getInstance().sendMessage(conversationType, saveCustomTargetId, msg, {
			onSuccess: function (message) {
				msgBox("提交成功",1000);
			},
			onError: function (errorCode) {
				msgBox("提交失败",1000);
			}
		});
	}
	var adminUserRender = function () {
		var queryString = location.search;
		var userId = queryString.substring(1, queryString.length);
		// var isAdmin =  userId.indexOf('admin') == 0;
		if (role == 'admin') {
			$('.rcs-chat-wrapper')[0].style.width = "75%";
			$('.rcs-chat-custom-info')[0].style.display = "block";
		}
	}

	//断线重连
	var reconnect = function () {
		var callback = {
			onSuccess: function (userId) {
				console.log('reconnect success. ' + userId);
			},
			onTokenIncorrect: function () {
				console.log('token 无效');
			},
			onError: function (errorCode) {
				console.log(errorCode);
			}
		};
		var config = {
			auto: true,
			url: 'cdn.ronghub.com/RongIMLib-2.5.1.min.js?d=' + Date.now(),
			rate: [100, 1000, 3000, 6000, 10000]
		};
		RongIMClient.reconnect(callback);
	}

	//对外暴露
	RCS.init = init;
	RCS.send = send;
	RCS.keySend = keySend;
	RCS.showemoji = showemoji;
	RCS.chooseEmoji = chooseEmoji;
	RCS.loadHisMessages = loadHisMessages;
	RCS.scrollBottom = scrollBottom;
	RCS.imgUpload = imgUpload;
	RCS.fileUpload = fileUpload;
	RCS.endConversation = endConversation;
	RCS.confirm = confirm;
	RCS.close = close;
	RCS.viewImage = viewImage;
	RCS.escImageView = escImageView;
	RCS.keyboard = keyboard;
	// RCS.customEdit = customEdit;
	RCS.customSubmit = customSubmit;
})(RCS);

/**
* 显示提示信息
* @param text
*/
var t;
var tt;
function msgBox(text,time) {
	if (g('checkError') != null) {
		hide('checkError');
	}
	if (text == '') {
		return;
	}
	var msgDiv = g('message');
	msgDiv.innerHTML = text;
	msgDiv.style.opacity = 1;
	msgDiv.style.filter = "alpha(opacity=100)";
	show('message');
	clearTimeout(t);
	clearTimeout(tt);
	tt = setTimeout(function () { test('message') }, time);
}
function test(id) {
	g(id).style.opacity = 0;
	g(id).style.filter = "alpha(opacity=0)";
	t = setTimeout(function () { hide('message') }, 300);
}
function g(id) {
	return document.getElementById(id);
}
function hide(id) {
	g(id).style.display = 'none';
}
function show(id) {
	g(id).style.display = 'block';
}