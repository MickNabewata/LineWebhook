"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var express=require("express"),Index=function(){this.Router=express.Router(),this.Router.get("/",function(e,r,t){r.render("index",{title:"Express"})})};exports.default=Index;