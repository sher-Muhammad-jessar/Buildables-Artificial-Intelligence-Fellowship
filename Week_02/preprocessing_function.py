import string

def clean_text(text):
    #Lowercase
    text=text.lower()
    # remove punctuation
    text=text.translate(str.maketrans("","",string.punctuation))
    #remove extra spaces 

    text=" ".join(text.split())
    return text

#Test
sample="   Hello !!!         How are you ??  "
print(clean_text(sample))