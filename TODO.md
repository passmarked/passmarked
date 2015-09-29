
- [x] json output is not contained in an array
- [x] should reading from stdin be a mode enabled with a flag or implicit?
  + [x] it should be implicit
- [ ] address submission to passmarked api
  + [ ] websocket connection to passmarked api for address submission results
- [ ] add a codeclimate repo key to travis config
- [ ] expose a node api on top of cli use
- [ ] more test cases across `/lib`
- [ ] normalise the output, example:
  ```
   ✔ passmarked.com:  results not yet available
   ✔ passmarked-cli:  google.com 83
  ```
      the first line should also show the address
