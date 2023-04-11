module.exports = `
<div class="home view">
  <h3 data-focus tabindex="-1"><span class="sr-only">List of</span> Candidates</h3>
  <!-- <div class="subhed"><i><!= window.LABELS.incumbentnote %></i></div> -->
  <hr>
  <ul class="people">
    <% data.candidates.forEach(function(c) { %>
    
      <!-- if responded / if incumbent -->
      <li> <a 
        <% if (c.responded) { %> href="#/candidate/<%= c.short %>" <% } %>
      >
      <% if (c.photo) { %>
        <img alt="" class="mug" src="./assets/<%= c.photo %>">
      <% } else { %>
        <div class="mug placeholder"></div>
      <% } %>

      <!-- name (obv) -->
          <% if (c.incumbent) { %>
            <%= c.name %> <span class ="incumbent"> * </span>
          <% } else { %>
            <%= c.name %> <%= c.party_short ? "(" + c.party_short + ")" : '' %>
          <% } %> 
          <% if (c.responded) { %>
            <br> 
          <% } else { %>
           <br>
           <i>No response</i>
          <% } %> 
      </a>
    <% }); %>
  </ul>


  <h3>Questions</h3>
  <hr>
  <ul class="questions">
    <% data.questions.forEach(function(q) { %>
    <li> 
      <% if (q.reader) { %>
        <span> &#128172; </span> <a href = "#/question/<%= q.short %>"> <%= q.question %> </a>
      <% } else { %>
        <a href = "#/question/<%= q.short %>"> <%= q.question %> </a>
    <% }}); %>
   
  </ul>
</div>
`