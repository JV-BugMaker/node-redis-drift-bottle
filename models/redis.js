var redis = require('redis'),
    client = redis.createClient();

exports.throw = function(bottle,callback){
    bottle.time = bottle.time || Date.now();
    //gengrate unquin key 
    var bottleId = Math.random().toString(16);
    var type = {male:0,female:1};
    //save to redis
    client.SELECT(type[bottle.type],function(){
        //save hash 
        client.HMSET(bottleId,bottle,function(err,result){
            if(err){
                return callback({code:0,msg:"存储数据出问题"});
            }
            //return result
            callback({code:1,msg:"返回数据成功",content:result});
            //set expire
            client.EXPIRE(bottleId,86400);
        });
    });
}

exports.pick = function(info,callback){
    var type = {all:Math.round(Math.random()),male:0,female:1};
    info.type = info.type || 'all';
    //request to select db
    client.SELECT(type[info.type],function(){
        // return random bottleid
        client.RANDOMKEY(function(err,bottleId){
            if(!bottleId){
                return callback({code:0,msg:"空空如也"});
            }
            // get full info
            client.HGETALL(bottleId,function(err,bottle){
                if(err){
                    return callback({code:0,msg:"bottle  break"});
                }
                //return result
                callback({code:1,msg:"get success",content:bottle});
                // delete redis
                client.DEL(bottleId);
            });
        })
    });
};