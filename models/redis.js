var redis = require('redis'),
    client = redis.createClient(),
    client2 = redis.createClient(),
    client3 = redis.createClient();

exports.throw = function(bottle,callback){
    client2.SELECT(2,function(){
        // get user throw bottlo numbers
        client2.GET(bottle.owner,function(err,result){
            if(result >= 10){
                return callback({code:0,msg:'you have no chance to throw bottle'});
            }
            //throw bottle add 1
            client2.INCR(bottle.owner,function(){
                client2.TTL(bottle.owner,function(err,ttl){
                    if(ttl === -1){
                        client2.EXPIRE(bottle.owner,86400);
                    }
                });
            });
            //
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
        });
    });

}

exports.pick = function(info,callback){
    client3.SELECT(3,function(){
        client3.GET(info.user,function(err,result){
            if(result >= 10){
                return callback({code:0,msg:'今天捡瓶子的机会已经用完了'});
            }
            client3.INCR(info.user,function(){
                client3.TTL(info.user,function(err,ttl){
                    if(ttl === -1){
                        client3.EXPIRE(info.user,86400);
                    }
                });
            });
            //
            //add sea-star  20%
        if(Math.random() <= 0.2){
            return callback({code:0,msg:'sea star!'});
        }
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
        });
    });
};
// throw back to sea
exports.throwBack = function(bottle,callback){
    var type = {male:0,female:1};
    //gengrate id
    var bottleId = Math.random().toString(16);
    client.SELECT(type[bottle.type],function(){
        client.HMSET(bottleId,bottle,function(err,result){
            if(err){
                return callback({code:0,msg:'some error'});
            }

            callback({code:1,msg:'success',content:result});
            client.PEXPIRE(bottleId,bottle.time+86400000 - Date.now());
        });
    });
};