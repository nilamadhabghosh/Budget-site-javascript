// Budget controller module
var BudgetContoller = (function(){

    var Expense = function(id, description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcpercentage = function (totalincome){
        if(totalincome > 0){
       this.percentage = Math.round((this.value/totalincome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

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

        deleteItem : function(type,id){
              var ids,index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            }) ;

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
               
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
        },
        calculatePercentage : function(){
             data.allItems.exp.forEach(function(cur){
               cur.calcpercentage(data.totals.inc);
             });
        },
        getPercentage : function(){
             var allperc = data.allItems.exp.map(function(cur){
                 return cur.getPercentage();
             });
             return allperc;
        },
        testing : function (){
            return data;
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
        container : '.container',
        expenseperLabel : '.item__percentage',
        Budgetmonth : '.budget__title--month'
    };

        var formatNumber = function(num,type){
            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');

            int = numSplit[0];
            dec = numSplit[1];

            if(int.length > 3)
            {
                int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
            }

            return (type === 'exp'?'-':'+') + ' '+ int + '.' + dec;
        };

        var NodeListForEach = function(list,callback){
            for ( var i=0;i<list.length;i++){
                callback(list[i],i);
            }
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
                newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

                // Insert the HTML into the DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            },
            
            //delete selected item from the list
            deletLIstItem : function(selectorID){
               var el = document.getElementById(selectorID);
               el.parentNode.removeChild(el);
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

        displayPercentages : function(percentage){
          var fields = document.querySelectorAll(DOMString.expenseperLabel);

          NodeListForEach(fields,function(current,index){
               
            if (percentage[index] > 0){
                 current.textContent = percentage[index]+'%';
            }else{
                 current.textContent = '---';
            }
          });
        },

        displaybudget: function(obj){

            var type;

            obj.budget > 0 ? type = 'inc':type = 'exp';
            
            document.querySelector(DOMString.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMString.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMString.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMString.percentageLabel).textContent = obj.percentage + '%';

            } else {
                document.querySelector(DOMString.percentageLabel).textContent = '----';

            }
        },

        displaymonth : function(){
            
            var date,month,months,year;

            date = new Date();
            month = date.getMonth();
            year = date.getFullYear();

        months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

            document.querySelector(DOMString.Budgetmonth).textContent = months[month] + ' '+year;
        },

        changedType : function(){
            
            var fields = document.querySelectorAll(DOMString.inputType + ','+ DOMString.inputdescription +','+ DOMString.inputvalue);

            NodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMString.addButton).classList.toggle('red');
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

    document.querySelector(DOM.inputType).addEventListener('change',UIctrl.changedType);

    };

    
    var updatebudget = function(){

        //calculate budget
        budgetctrl.calculateBudget();

        //Return budget
        var budget = budgetctrl.getBudget();

        //Display the budget on UI
        UIctrl.displaybudget(budget);
      
    };

    var updatePercentage = function(){
         
        //calculate the total percentage
           budgetctrl.calculatePercentage();
        //return budget controller
           var percentage = budgetctrl.getPercentage();
        //Display to UI
         UIctrl.displayPercentages(percentage);
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

        //Update Percentage
        updatePercentage();
        }
    }

    var ctrldeleteItem = function(event){
         var itemId,splitId,ID;

         itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

         if(itemId){
             splitId = itemId.split('-');
             type = splitId[0];
             ID= parseInt(splitId[1]);

             //delete item from data structure
                budgetctrl.deleteItem(type,ID);
             //delete from UI
                UIctrl.deletLIstItem(itemId);
             //update new budget
               updatebudget();
               //Update Percentage
               updatePercentage();
         }
    };

    return{
        init : function(){
            console.log("application Start");
            UIctrl.displaymonth();
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