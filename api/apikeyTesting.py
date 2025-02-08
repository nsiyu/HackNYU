import openai

def check_openai_api_key(api_key):
    client = openai.OpenAI(api_key=api_key)
    try:
        client.models.list()
        return True
    except openai.AuthenticationError:
        return False
    except Exception as e:
        print(f"Error checking key: {str(e)}")
        return False

# List of API keys to test
api_keys = keys = [
   "abc"
]


# Test each key
for i, api_key in enumerate(api_keys, 1):
    is_valid = check_openai_api_key(api_key)
    print(f"Key {i}: {'Valid' if is_valid else 'Invalid'} - {api_key[:10]}...")