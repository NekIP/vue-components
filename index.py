from flask import Flask, render_template
app = Flask(__name__,
	template_folder="", 
	static_folder='', 
	static_url_path='')

@app.route("/")
def hello():
    return render_template('index.html')

app.run(debug=True)