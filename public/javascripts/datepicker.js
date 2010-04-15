// Copyright 2010 Keith Platfoot

function DatePicker(textboxId){
  this.textbox = $(textboxId);
  this.div = $(textboxId + "_datepicker");
  
  this.textbox.observe("focus", this.onFocus.bindAsEventListener(this));
  this.textbox.observe("click", this.onClick.bindAsEventListener(this));
  this.textbox.observe("blur", this.onBlur.bindAsEventListener(this));
  this.textbox.observe("keydown", this.onKeyPress.bindAsEventListener(this));
  this.div.observe("click", this.onDivClick.bindAsEventListener(this));
}

DatePicker.DAY = 1000 * 60 * 60 * 24; // ms in 1 day
DatePicker.MONTH_NAMES = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

DatePicker.prototype = {
  onDivClick: function(){
    this.keepVisible = !this.dateSelected;
    this.textbox.focus();
  },
  
  popup: function(){
    if (!this.div.visible()) {
      this.initCalendar();
      this.positionDiv();
      this.renderCalendar();
      this.div.show();
    }
    // This only works on Firefox if it's outside the if statement above.  No idea why.
    this.ensureCalendarVisible();
  },
  
  positionDiv: function(){
    // Position calendar div at bottom left edge of textbox
    if (!this.div.style.position || this.div.style.position == 'absolute') {
      this.div.style.position = 'absolute';
      this.div.clonePosition(this.textbox, {
        setHeight: false,
        setWidth: false,
        offsetTop: this.textbox.offsetHeight
      });
    }
  },
  
  ensureCalendarVisible: function(){
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var viewportOffsetY = this.div.viewportOffset().top;

    // If the element is below the bottom of the viewport, scroll the element up into view
    if (viewportOffsetY > 0 && viewportOffsetY + this.div.getHeight() > viewportHeight) {
      this.div.scrollIntoView(false);
    }      
  },
  
  initCalendar: function(){
    this.dateSelected = false;
    
    // Default to today
    this.selectedDate = new Date();
    
    // Try to get the date from the textbox
    var match = $F(this.textbox).match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
    if (match) {
      // Convert the values into a proper JS date object
      var month = Number(match[1]) - 1;
      var day = Number(match[2]);
      var year = Number(match[3]);
      if (year < 100) 
        year += (year < 25 ? 2000 : 1900);
      
      var date = new Date(year, month, day);
      
      // If date is valid, set it as the selected date
      if (date && date.getDate() == day && date.getMonth() == month && date.getFullYear() == year) 
        this.selectedDate = date;
    }
    
    this.calendarYear = this.selectedDate.getFullYear();
    this.calendarMonth = this.selectedDate.getMonth();
  },
  
  onFocus: function(event){
    this.popup();
  },
  
  onClick: function(event){
    this.popup();
  },
  
  onBlur: function(event){
    this.hide();
  },
  
  onKeyPress: function(event) {
    switch (event.keyCode) {
      case Event.KEY_ESC:
        this.hide();
        Event.stop(event);
        return;
    }
  },
  
  hide: function(){
    // Cancel any pending delayedHide's
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
    }
    
    // We need to delay the hide, since the month switch steals focus from textbox
    var delayedHide = function(){
      this.hideTimeoutId = null;
      if (!this.keepVisible) 
        this.div.hide();
      else 
        this.keepVisible = false;
    };
    this.hideTimeoutId = setTimeout(delayedHide.bind(this), 200);
  },
  
  renderCalendar: function(){
    // Build the calendar frame
    var table = new Element("table", { cellPadding: "4", cellSpacing: "0" });
    var tbody = new Element("tbody");
    table.appendChild(tbody);
    var headerRow = new Element("tr");
    tbody.appendChild(headerRow);
    
    var headerLeft = new Element("td");
    headerRow.appendChild(headerLeft);
    var prevMonthDiv = new Element("div", { "class": "changeMonthLink" }).update("&lt;&lt;");
    prevMonthDiv.observe("click", this.prevMonth.bind(this));
    headerLeft.appendChild(prevMonthDiv);
    
    var monthText = DatePicker.MONTH_NAMES[this.calendarMonth] + ' ' + this.calendarYear
    var headerCenter = new Element("td", { "class": "monthName", colSpan: "5", align: "center" }).update(monthText);
    headerRow.appendChild(headerCenter);
    
    var headerRight = new Element("td");
    headerRow.appendChild(headerRight);
    var nextMonthDiv = new Element("div", { "class": "changeMonthLink" }).update("&gt;&gt;");
    nextMonthDiv.observe("click", this.nextMonth.bind(this));
    headerRight.appendChild(nextMonthDiv);
    
    var daysRow = new Element("tr");
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].each(function(abbr){
      var dayAbbrCell = new Element("td", { "class": "weekdayName", align: "center" }).update(abbr);
      daysRow.appendChild(dayAbbrCell);
    });
    tbody.appendChild(daysRow);
    
    var monthFirstDay = new Date(this.calendarYear, this.calendarMonth, 1, 12);
    var calendarFirstDay = new Date(monthFirstDay.getTime() - monthFirstDay.getDay() * DatePicker.DAY);
    
    // Build the calendar cells        
    var d = calendarFirstDay;
    for (var week = 0; week < 6; week++) {
      var weekRow = new Element("tr");
      for (var weekday = 0; weekday < 7; weekday++) {
        var classNames = 'day';
        
        var today = new Date();
        if (d.getDate() == today.getDate() && d.getMonth() == today.getMonth() && d.getFullYear() == today.getFullYear()) 
          classNames += " today";
        
        if (this.selectedDate && d.getDate() == this.selectedDate.getDate() && d.getMonth() == this.selectedDate.getMonth() && d.getFullYear() == this.selectedDate.getFullYear()) 
          classNames += " daySelected";
        else 
          if (d.getMonth() == this.calendarMonth) 
            classNames += " dayInMonth";
          else 
            classNames += " dayOutsideMonth";
        
        // Create this day's cell
        var dayCell = new Element("td", { "class": classNames, align: "center" }).update(d.getDate().toString());
        weekRow.appendChild(dayCell);
         
        // Create a closure for this day's selector function
        var dayLinkFunc = this.dateLinkFunc(d);
        dayCell.observe("click", dayLinkFunc.bind(this));
        
        // Move on to the next day
        d.setTime(d.getTime() + DatePicker.DAY);
      }
      
      tbody.appendChild(weekRow);
      
      if (d.getMonth() != this.calendarMonth) 
        break;
    }
    
    // Remove the old month's content, if necessary
    var currentChild = this.div.firstDescendant();
    if (currentChild) 
      $(currentChild).remove();
    
    this.div.appendChild(table);
  },
  
  selectDate: function(date){
    this.textbox.value = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    this.textbox.focus();
    this.keepVisible = false;
    this.dateSelected = true;
    this.hide();
  },
  
  dateLinkFunc: function(date){
    var copy = new Date(date.getTime());
    return function(){
      this.selectDate(copy);
    };
  },
  
  prevMonth: function(){
    this.changeMonth(-1);
  },
  
  nextMonth: function(){
    this.changeMonth(1);
  },
  
  changeMonth: function(delta){
    this.calendarMonth += delta;
    if (this.calendarMonth == 12) {
      this.calendarMonth = 0;
      this.calendarYear++;
    }
    else 
      if (this.calendarMonth == -1) {
        this.calendarMonth = 11;
        this.calendarYear--;
      }
    this.renderCalendar();
    this.onDivClick(); // IE doesn't bubble up to this, so call it manually
  }
}
