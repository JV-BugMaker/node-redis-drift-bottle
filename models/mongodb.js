var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/drifter');

//定义漂流瓶模型 并设置数据储存到bottles集合
var bottleModel = mongoose.model('Bottle',new mongoose.Schema({
    bottle:Array,
    message:Array
},{
    collection:'bottles'
}));
//将用户检测到漂流瓶该表格式保存
exports.save = function(picker,_bottle,callback){
    var bottle = {bottle:[],message:[]};
    bottle.bottle.push(picker);
    bottle.message.push([_bottle.owner,_bottle.time,_bottle.conent]);
    bottle = new bottleModel(bottle);
    bottle.save(function(err){
        callback(err);
    });
};

exports.getAll = function(user,callback){
    bottleModel.find({'bottle':user},function(err,bottles){
        if(err){
            return callback({code:0,msg:'获取漂流瓶列表失败'});
        }
        callback({code:0,msg:'success',content:bottles});
    });
};

exports.getOne = function(_id,callback){
    //通过id 获取特定的漂流瓶
    bottleModel.findById(_id,function(err,bottle){
        if(err){
            return callback({code:0,msg:'读取漂流瓶失败...'});
        }
        //成功时返回找到的漂流瓶
        callback({code:1,msg:'success',content:bottle});
    });
};


exports.reply = function(_id,reply,callback){
    reply.time = reply.time || Date.now();
    //通过id 找到需要回复的漂流瓶
    bottleModel.findById(_id,function(err,_bottle){
        if(err){
            return callback({code:0,msg:'回复漂流瓶失败...'});
        }
        var newBottle = {};
        newBottle.bottle = _bottle.bottle;
        newBottle.message = _bottle.message;

        if(newBottle.bottle.length === 1){
            newBottle.bottle.push(_bottle.message[0][0]);
        }
        //在message添加一条回复信息
        newBottle.message.push([reply.user,reply.time,reply.content]);
        //更新数据模型
        bottleModel.findByIdAndUpdate(_id,newBottle,function(err,bottle){
            if(err){
                return callback({code:0,msg:'更新数据模型失败'});
            }
            callback({code:1,msg:'success',content:bottle});
        });

    });
};


exports.delete = function(_id,callback){
    bottleModel.findByIdAndRemove(_id,function(err){
        if(err){
            return callback({code:0,msg:'删除失败'});
        }
        callback({code:1,msg:'删除成功'});
    });
};