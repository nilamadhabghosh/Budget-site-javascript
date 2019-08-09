// Budget controller module
var BudgetContoller = (function(){

    var Expense = function(id, description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allitems: {
            inc: [],
            exp: []
        },
        totals: {
            exp : 0,
            inc : 0
        }
    };

    return{
        addItem : function(type,des,val)
        {
            var newItem, ID;
            
            //Create a new ID
            if(data.allitems[type].length > 0){
            ID = data.allitems[type][data.allitems[type].length - 1].id +1;
            }
            else{
                ID =0;
            }
            //create new Item
            if(type === 'exp')
            {
                newItem = Expense(ID,des,val);
            }
            else if(type === 'inc')
            {
                newItem = Income(ID,des,val);
            }
            
            //push data 
            data.allitems[type].push(newItem);
            return newItem;
        }
    }
})();

// UI controller module
var UIController = (function(){

    var DOMString = {
        inputType : '.add__type',
        inputdescription : '.add__description',
        inputvalue : '.add__value',
        addButton : '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expence__list'
    };

    return {
         getInput : function(){
             return{
              type : document.querySelector(DOMString.inputType).value,
              description : document.querySelector(DOMString.inputdescription).value,
              value1 : document.querySelector(DOMString.inputvalue).value
             };

            },

            addListItem: function(obj,type){
                
                var html,newhtml,element;
                //Create HTML string with placeholder
                if(type === 'inc'){  
                    element = DOMString.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
                else if(type === 'exp'){
                    element = DOMString.expenseContainer;
                    html =  '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }

                //replace placeholder with actual data;
                newhtml = html.replace('%id%',obj.id);
                newhtml = newhtml.replace('%description%',obj.description);
                newhtml = newhtml.replace('%value%',obj.value);

                //Insert html into DOM
                document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
            },

            getDOMstring : function(){
                return DOMString;
            }

    };
})();

// Global app controller module
var controller = (function(budgetctrl,UIctrl){

    var setupEventListner = function()
    {
        var DOM = UIctrl.getDOMstring();

        document.querySelector(DOM.addButton).addEventListener('click',ctrlAddItem)

        document.addEventListener('keypress',function(event){
        
        if(event.keyCode === 13 || event.which === 13)
        {
            ctrlAddItem();
        }
    });

    }
    


    var ctrlAddItem = function(){
         
        var input,newItem;

        //Get input data from UI
        input = UIctrl.getInput();
        
        //get objext from budget controller
        newItem = budgetctrl.addItem(input.type,input.description,input.value);

        //Add Item to the UI
        UIctrl.addListItem(newItem,input.type);
    }

    return{
        init : function(){
            console.log("application Start");
            setupEventListner();
        }
    }

    

})(BudgetContoller,UIController);

controller.init();