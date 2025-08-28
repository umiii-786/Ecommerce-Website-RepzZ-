class MyError extends Error{
    constructor(status,message){
        super(message)
        this.status=status
        this.message=message
    }
}

module.exports={
    MyError
}

console.log(new MyError(404,'helloworld').message)
console.log(new MyError(404,'helloworld').status)
