# Copyright 2010 Keith Platfoot

module ActionView
  module Helpers
    module FormHelper
      
      # Creates a text field with a popup JavaScript calendar
      def date_picker_text_field(object_name, method, tag_options = {})
        skip_style = tag_options.delete :skip_style
        tag_options[:autocomplete] = 'off'
        
        # Creates a text field for manual entry of dates.  Accepts a variety of formats (e.g., 2/18/1982, 1982-02-07, November 30th, 1957).       
        text_field = InstanceTag.new(object_name, method, self, tag_options.delete(:object))
        text_field_id = tag_options[:id] || text_field.send(:tag_id)
        
        (skip_style ? "" : date_picker_stylesheet) +
         text_field.to_date_text_field_tag(tag_options) + 
         content_tag("div", "", :id => "#{text_field_id}_datepicker", :class => 'datePicker', :style => 'display: none;') + 
         javascript_tag("new DatePicker('#{text_field_id}');")
      end
      
      private
      
      def date_picker_stylesheet
        content_tag('style', <<-EOT, :type => 'text/css')
          .datePicker {
            cursor: default;
            border: 1px solid gray;
            background-color: white;
            padding: 4px;
          }
          .changeMonthLink {
            cursor: pointer;
            color: #0000ff;
          }
          .monthName {
            font-weight: bold;
          }
          .weekdayName {
            color: gray;
          }
          .day {
            color: black;
            cursor: pointer;
          }
          .dayInMonth {
            background-color: #ffffcc;
          }
          .dayOutsideMonth {
            color: gray;
          }
          .daySelected {
            background-color: black;
            color: white;
          }
          .today {
            font-weight: bold;
          }
        EOT
      end
    end
  end
end

module ActionView
  module Helpers
    class InstanceTag
      def to_date_text_field_tag(options = {})
        date = value(object)
        # Not using strftime here because we don't want leading 0's
        options.merge!(:value => "#{date.month}/#{date.day}/#{date.year}") if date
        to_input_field_tag("text", options)
      end      
    end
    
    class FormBuilder
      def date_picker_text_field(method, options = {})
        @template.date_picker_text_field(@object_name, method, options.merge(:object => @object))
      end
    end    
  end
end
