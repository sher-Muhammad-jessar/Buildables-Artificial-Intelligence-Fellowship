import nltk
import string
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag, word_tokenize

# Download required resources
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')

def advanced_preprocess(text):
    # lowercase 
    text = text.lower()
 
    # remove punctuation & numbers 
    text = "".join([ch for ch in text if ch.isalpha() or ch.isspace()])

    # tokenize 
    words = word_tokenize(text)

    # remove stopwords   
    words = [w for w in words if w not in stopwords.words("english")]

    # lemmatization
    lemmatizer = WordNetLemmatizer()
    words = [lemmatizer.lemmatize(w) for w in words]
    
    # remove short words (<3 letters)
    words = [w for w in words if len(w) > 2]

    # POS tagging
    pos_tags = pos_tag(words)

    # keep only nouns (N), verbs (V), adjectives (J)
    filtered_words = [word for word, pos in pos_tags if pos.startswith("N") or pos.startswith("V") or pos.startswith("J")]

    return filtered_words


# test 
sample = "Studies show that running quickly improves health!"
print(advanced_preprocess(sample))
