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
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    };

    calculateTotal = function(type){
           var sum =0;
           data.allItems[type].forEach(function(cur){
               sum +=cur.value;
           });

           data.totals[type] = sum;
    }

    return{
        addItem : function(type,des,val)
        {
            var newItem, ID;

            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        calculateBudget : function(){
           
            //calculate total income and expenses
               calculateTotal('inc');
               calculateTotal('exp');
            //calculate the budget
                data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spend
               
            if (data.totals.inc > 0){
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage =-1;
            } 
        },
        getBudget : function(){
            return{
                budget: data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            };
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
        expenseContainer: '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container'
    };

    return {
         getInput : function(){
             return{
              type : document.querySelector(DOMString.inputType).value,
              description : document.querySelector(DOMString.inputdescription).value,
              value : parseFloat( document.querySelector(DOMString.inputvalue).value)
             };

            },

            addListItem: function(obj,type){
                
                var html,newHtml,element;
                //Create HTML string with placeholder

                if (type === 'inc') {
                    element = DOMString.incomeContainer;

                    html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                } else if (type === 'exp') {
                    element = DOMString.expenseContainer;

                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }

                // Replace the placeholder text with some actual data
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', obj.value);

                // Insert the HTML into the DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            },

            //Clearing the Description and value field

        clearFields: function () {
            var fields,fieldarr;
            
            fields = document.querySelectorAll(DOMString.inputdescription + ',' + DOMString.inputvalue);
            
            fieldarr = Array.prototype.slice.call(fields);

            fieldarr.forEach(function(current,index,array) {
                current.value = "";
            });
            
            fieldarr[0].focus();
      
        },

        displaybudget: function(obj){
            
            document.querySelector(DOMString.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMString.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMString.expenseLabel).textContent = obj.totalExp;
            
            if(obj.percentage > 0){
                document.querySelector(DOMString.percentageLabel).textContent = obj.percentage + '%';

            } else {
                document.querySelector(DOMString.percentageLabel).textContent = '----';

            }
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

    document.querySelector(DOM.container).addEventListener('click', ctrldeleteItem);

    };

    
    var updatebudget = function(){

        //calculate budget
        budgetctrl.calculateBudget();

        //Return budget
        var budget = budgetctrl.getBudget();

        //Display the budget on UI
        UIctrl.displaybudget(budget);
      
    };



    var ctrlAddItem = function(){
         
        var input,newItem;

        //Get input data from UI
        input = UIctrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
        
        //get objext from budget controller
        newItem = budgetctrl.addItem(input.type,input.description,input.value);

        //Add Item to the UI
        UIctrl.addListItem(newItem,input.type);

        //For Clear Fields
        UIctrl.clearFields();

        //calculate adn update Budget
        updatebudget();
        }
    }

    var ctrldeleteItem = function(event){
         var itemId,splitId,id;

         itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

         if(itemId){
             splitId = itemId.split('-');
             type = splitId[0];
             id=splitId[1];

             //delete item from data structure
                
             //delete from UI
             
             //update new budget
         }
    };

    return{
        init : function(){
            console.log("application Start");
            UIctrl.displaybudget({
               budget : 0,
               totalInc : 0,
               totalExp : 0,
               percentage : -1
            });
            setupEventListner();
        }
    }

    

})(BudgetContoller,UIController);

controller.init();